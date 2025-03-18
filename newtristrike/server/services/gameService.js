import db from "../config/db.js";
import { distributePrizePool, getTotalPrizePool } from "./prizeService.js";  

let gameState = {
    timer: 59,
    winningNumber: generateWinningNumber(),
    gameId: null,
    isProcessing: false,
};

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// 🔹 Initialize game state from the database
export async function initializeGameState(io) {
    try {
        const results = await query(
            `SELECT id, winning_num, TIMESTAMPDIFF(SECOND, created_at, NOW()) AS elapsed 
            FROM games WHERE status = 'ongoing' ORDER BY id DESC LIMIT 1`
        );

        if (results.length === 0) {
            console.warn("No active game found. Creating a new one...");
            await createNewGame(io);
        } else {
            let elapsed = results[0].elapsed || 0;
            gameState = {
                gameId: results[0].id,
                timer: Math.max(0, 59 - elapsed),
                winningNumber: results[0].winning_num,
                isProcessing: false,
            };

            console.log(`Loaded active game: ID=${gameState.gameId}, Timer=${gameState.timer}`);

            // 🔥 Emit initial game state + response
            io.emit("game_state", {
                status: "success",
                message: `Game ${gameState.gameId} loaded successfully.`,
                data: gameState
            });
        }
    } catch (err) {
        console.error("❌ Database error while fetching game state:", err);
        io.emit("game_error", {
            status: "error",
            message: "Failed to load game state.",
            error: err.message
        });
    }
}

// Start the game loop and broadcast updates
export function startGameService(io) {
    setInterval(async () => {
        if (gameState.timer > 0) {
            gameState.timer--;
        } else if (!gameState.isProcessing) {
            console.log("⏳ Timer reached 0. Creating new game...");
            gameState.isProcessing = true; 
            await createNewGame(io);
        }

        console.log(`🕒 Timer: ${gameState.timer} | 🎰 Winning Number: ${gameState.winningNumber}`);

        if (gameState.gameId) {
            io.emit("game_update", {
                timer: gameState.timer,
                winningNumber: gameState.winningNumber
            });
        }
    }, 1000);
}

//  Create a new game round
async function createNewGame(io) {
    try {
        if (gameState.gameId) {
            console.log(`🏁 Ending Game ${gameState.gameId} before starting a new one...`);
            try {
                const message = await distributePrizePool(gameState.gameId);
                console.log(`🎉 ${message}`);

                io.emit("prize_distribution", {
                    status: "success",
                    message: `Prizes distributed for game ${gameState.gameId}.`,
                    details: message
                });
            } catch (err) {
                console.error("❌ Error distributing prizes:", err);
                io.emit("prize_distribution", {
                    status: "error",
                    message: `Failed to distribute prizes for game ${gameState.gameId}.`,
                    error: err.message
                });
            }
        }

        // Reset game state
        gameState.timer = 59;
        gameState.winningNumber = generateWinningNumber();

        // Finish the previous game
        await query(`UPDATE games SET status = 'finished' WHERE status = 'ongoing'`);

        // Insert a new game
        const result = await query(
            `INSERT INTO games (winning_num, prize_pool, status) VALUES (?, 20, 'ongoing')`,
            [gameState.winningNumber]
        );

        gameState.gameId = result.insertId;
        gameState.isProcessing = false;
        console.log(`✅ New game started (ID: ${gameState.gameId})`);

        // 🔥 Emit new game state
        io.emit("new_game", {
            status: "success",
            message: `New game created successfully (ID: ${gameState.gameId}).`,
            data: gameState
        });

        try {
            const previousPrizePool = await getTotalPrizePool(gameState.gameId - 1);

            if (previousPrizePool > 0) {
                console.log(`🔄 Carrying over prize pool of ${previousPrizePool} from game ${gameState.gameId - 1} to game ${gameState.gameId}`);

                // Carry over prize pool
                await query(
                    `UPDATE games SET prize_pool = prize_pool + ? WHERE id = ?`,
                    [previousPrizePool, gameState.gameId]
                );

                console.log(`✅ Prize pool carried over: ${previousPrizePool}`);

                // Confirm updated prize pool
                const newPrizePool = await getTotalPrizePool(gameState.gameId);
                console.log(`🏆 Updated prize pool for game ${gameState.gameId}: ${newPrizePool}`);

                // 🔥 Emit prize pool update
                io.emit("prize_pool_update", {
                    status: "success",
                    message: `Prize pool updated to ${newPrizePool} coins.`,
                    newPrizePool
                });
            } else {
                console.log(`🚫 No prize to carry over from game ${gameState.gameId - 1}`);
            }
        } catch (err) {
            console.error("❌ Error handling prize pool:", err);
            io.emit("prize_pool_update", {
                status: "error",
                message: "Failed to update prize pool.",
                error: err.message
            });
        }
    } catch (err) {
        console.error("❌ Database error while inserting game:", err);
        io.emit("new_game", {
            status: "error",
            message: "Failed to create new game.",
            error: err.message
        });
    }
}

export function getGameState(callback) {
    callback(gameState);
}

function generateWinningNumber() {
    let numbers = new Set();

    while (numbers.size < 3) {
        numbers.add(Math.floor(Math.random() * 11) + 1);
    }

    return Array.from(numbers).join('-');
}
