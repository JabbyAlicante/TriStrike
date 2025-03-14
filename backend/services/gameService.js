import db from "../config/db.js";
import { distributePrizePool, getTotalPrizePool } from "./prizeService.js";  

let gameState = {
    timer: 59,
    winningNumber: generateWinningNumber(),
    gameId: null,
    isProcessing: false,
};

// Initialize game state from the database
export function initializeGameState() {
    db.query(
        `SELECT id, winning_num, TIMESTAMPDIFF(SECOND, created_at, NOW()) AS elapsed 
        FROM games WHERE status = 'ongoing' ORDER BY id DESC LIMIT 1`, 
    (err, results) => {
        if (err) {
            console.error("❌ Database error while fetching game state:", err);
            return;
        }

        if (results.length === 0) {
            console.warn("⚠ No active game found. Creating a new one...");
            createNewGame();
        } else {
            let elapsed = results[0].elapsed || 0;
            gameState = {
                gameId: results[0].id,
                timer: Math.max(0, 59 - elapsed),
                winningNumber: results[0].winning_num,
                isProcessing: false, 
            };
            console.log(`✅ Loaded active game: ID=${gameState.gameId}, Timer=${gameState.timer}`);
        }
    });
}

// Start the game loop and broadcast updates
export function startGameService(io) {
    setInterval(() => {
        if (gameState.timer > 0) {
            gameState.timer--;
        } else if (!gameState.isProcessing) {
            console.log("⏳ Timer reached 0. Creating new game...");
            gameState.isProcessing = true; 
            createNewGame();
        }

        console.log(`🕒 Timer: ${gameState.timer} | 🎰 Winning Number: ${gameState.winningNumber}`);

        if (gameState.gameId) {
            io.to("authenticated").emit("game_update", gameState);
        }
    }, 1000);
}

// Create a new game round
function createNewGame() {
    if (gameState.gameId) {
        console.log(`🏁 Ending Game ${gameState.gameId} before starting a new one...`);
        distributePrizePool(gameState.gameId, (err, message) => {
            if (err) {
                console.error("❌ Error distributing prizes:", err);
            } else {
                console.log(`🎉 ${message}`);
            }
        });
    }

    gameState.timer = 59;
    gameState.winningNumber = generateWinningNumber();

    // Finish the previous game
    db.query(`UPDATE games SET status = 'finished' WHERE status = 'ongoing'`, (err) => {
        if (err) {
            console.error("❌ Error updating game status:", err);
        }
    });

    // Insert a new game
    db.query(`INSERT INTO games (winning_num, prize_pool, status) VALUES (?, 20, 'ongoing')`, 
        [gameState.winningNumber], (err, result) => {
            if (!err) {
                gameState.gameId = result.insertId;
                gameState.isProcessing = false; 
                console.log(`✅ New game started (ID: ${gameState.gameId})`);

                // Fetch previous game's prize pool and carry it over
                getTotalPrizePool(gameState.gameId - 1, (err, previousPrizePool) => {
                    if (err) {
                        console.error("❌ Error fetching previous prize pool:", err);
                        return;
                    }

                    if (previousPrizePool > 0) {
                        console.log(`🔄 Carrying over prize pool of ${previousPrizePool} from game ${gameState.gameId - 1} to game ${gameState.gameId}`);
                        
                        // carried-over prize to the new game's pool
                        db.query(
                            `UPDATE games SET prize_pool = prize_pool + ? WHERE id = ?`,
                            [previousPrizePool, gameState.gameId],
                            (err) => {
                                if (err) {
                                    console.error("❌ Error carrying over prize pool:", err);
                                } else {
                                    console.log(`✅ Prize pool carried over: ${previousPrizePool}`);

                                    // Confirm updated prize pool
                                    getTotalPrizePool(gameState.gameId, (err, newPrizePool) => {
                                        if (!err) {
                                            console.log(`🏆 Updated prize pool for game ${gameState.gameId}: ${newPrizePool}`);
                                        }
                                    });
                                }
                            }
                        );
                    } else {
                        console.log(`🚫 No prize to carry over from game ${gameState.gameId - 1}`);
                    }
                });

            } else {
                console.error("❌ Database error while inserting game:", err);
            }
        }
    );
}


export function getGameState(callback) {
    callback(gameState);
}

function generateWinningNumber() {
    let numbers = new Set();

    while (numbers.size < 3)  {
        numbers.add(Math.floor(Math.random() * 12) + 1);
    }

    return Array.from(numbers).join('-');
    
}
