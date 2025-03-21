import db from "../config/db.js";
import { distributePrizePool, getTotalPrizePool } from "./prizeService.js";

const isServer = process.env.PORT ? process.env.PORT === "3000" : true;

let gameState = {
    timer: 59,
    winningNumber: null,
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

export async function initializeGameState(io) {
    try {
        const results = await query(
            `SELECT id, winning_num, TIMESTAMPDIFF(SECOND, created_at, NOW()) AS elapsed 
            FROM games WHERE status = 'ongoing' ORDER BY id DESC LIMIT 1`
        );

        if (results.length === 0) {
            console.warn("⚠️ No active game found. Creating a new one...");
            if (isServer) await createNewGame(io);
        } else {
            let elapsed = results[0].elapsed != null ? results[0].elapsed : 0;
            gameState = {
                gameId: results[0].id,
                timer: Math.max(0, 59 - elapsed),
                winningNumber: results[0].winning_num,
                isProcessing: false,
            };

            console.log(`🔄 Loaded active game ID=${gameState.gameId}, Timer=${gameState.timer}, Number=${gameState.winningNumber}`);

            io.emit("game_state", {
                status: "success",
                message: `Game ${gameState.gameId} loaded successfully.`,
                data: gameState
            });
        }
    } catch (err) {
        console.error("❌ Error loading game state:", err);
        io.emit("game_error", {
            status: "error",
            message: "Failed to load game state.",
            error: err.message
        });
    }
}

// Main game loop
export function startGameService(io) {
    setInterval(async () => {
        if (!isServer) return;

        try {
            if (gameState.timer > 0) {
                gameState.timer--;
            } else if (!gameState.isProcessing) {
                console.log("⏳ Timer reached 0. Creating new game...");
                await createNewGame(io);
            }
            console.log(`🕒 Timer: ${gameState.timer} | 🎰 Winning Number: ${gameState.winningNumber}`);

            // ✅ Broadcast consistent state across servers
            io.emit("game_update", {
                timer: gameState.timer,
                winningNumber: gameState.winningNumber
            });
        } catch (err) {
            console.error("❌ Error in game loop:", err);
        }
    }, 1000);
}

// ✅ Create a new game round
async function createNewGame(io) {
    if (!isServer) return;

    if (gameState.isProcessing) return;
    gameState.isProcessing = true;

    try {
        // ✅ End previous game if exists
        if (gameState.gameId) {
            console.log(`🏁 Ending Game ${gameState.gameId}...`);
            await distributePrizePool(gameState.gameId);
        }

        gameState.timer = 59;
        gameState.winningNumber = generateWinningNumber();

        await query(`UPDATE games SET status = 'finished' WHERE status = 'ongoing'`);

        const result = await query(
            `INSERT INTO games (winning_num, prize_pool, status, created_at) VALUES (?, 20, 'ongoing', NOW())`,
            [gameState.winningNumber]
        );

        gameState.gameId = result.insertId;

        console.log(`✅ New game created (ID: ${gameState.gameId}) with winning number: ${gameState.winningNumber}`);

        io.emit("new_game", {
            status: "success",
            message: `New game created successfully (ID: ${gameState.gameId}).`,
            data: gameState
        });

        await carryOverPrizePool(io);
    } catch (err) {
        console.error("❌ Error creating new game:", err);
        io.emit("new_game", {
            status: "error",
            message: "Failed to create new game.",
            error: err.message
        });
    } finally {
        gameState.isProcessing = false;
    }
}

async function carryOverPrizePool(io) {
    try {
        const previousGame = await query(
            `SELECT id, prize_pool FROM games WHERE status = 'finished' ORDER BY id DESC LIMIT 1`
        );

        if (previousGame.length > 0) {
            const previousPrizePool = previousGame[0].prize_pool;

            if (previousPrizePool > 0) {
                await query(
                    `UPDATE games SET prize_pool = prize_pool + ? WHERE id = ?`,
                    [previousPrizePool, gameState.gameId]
                );

                const newPrizePool = await getTotalPrizePool(gameState.gameId);
                console.log(`🏆 Carried over ${previousPrizePool} coins to game ${gameState.gameId}`);

                io.emit("prize_pool_update", {
                    status: "success",
                    message: `Prize pool updated to ${newPrizePool} coins.`,
                    newPrizePool
                });
            } else {
                console.log(`🚫 No prize pool to carry over from game ${previousGame[0].id}`);
            }
        }
    } catch (err) {
        console.error("❌ Error carrying over prize pool:", err);
        io.emit("prize_pool_update", {
            status: "error",
            message: "Failed to update prize pool.",
            error: err.message
        });
    }
}

export function getGameState() {
    return(gameState);
}

function generateWinningNumber() {
    let numbers = new Set();

    while (numbers.size < 3) {
        numbers.add(Math.floor(Math.random() * 11) + 1);
    }

    return Array.from(numbers).join('-');
}
