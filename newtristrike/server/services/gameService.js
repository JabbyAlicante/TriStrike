import db from "../config/db.js";
import { distributePrizePool } from "./prizeService.js";

const isServer = process.env.PORT ? process.env.PORT === "3000" : true;

let gameState = {
    timer: 10,
    winningNumber: null,
    gameId: null,
    prizePool: 0,
    isProcessing: false,
};

export async function initializeGameState(io) {
    try {
        const [results] = await db.query(
            `SELECT id, winning_num, prize_pool, TIMESTAMPDIFF(SECOND, created_at, NOW()) AS elapsed 
            FROM games WHERE status = 'ongoing' ORDER BY id DESC LIMIT 1`
        );

        if (results.length === 0) {
            console.warn("⚠️ No active game found. Creating a new one...");
            if (isServer) await createNewGame(io);
        } else {
            let elapsed = results[0].elapsed ?? 0;
            gameState = {
                gameId: results[0].id,
                timer: Math.max(0, 59 - elapsed),
                winningNumber: results[0].winning_num,
                prizePool: results[0].prize_pool,
                isProcessing: false,
            };

            console.log(`🔄 Loaded active game ID=${gameState.gameId}, Timer=${gameState.timer}, Number=${gameState.winningNumber}, Prize Pool=${gameState.prizePool}`);

            io.emit("game_state", {
                status: "success",
                message: `Game ${gameState.gameId} loaded successfully.`,
                gameId: gameState.gameId,
                prizePool: gameState.prizePool,
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
            console.log(`🕒 Timer: ${gameState.timer} | 🎰 Winning Number: ${gameState.winningNumber} | 💰 Prize Pool: ${gameState.prizePool}`);

            io.emit("game_update", {
                gameId: gameState.gameId,
                timer: gameState.timer,
                winningNumber: gameState.winningNumber,
                prizePool: gameState.prizePool
            });
        } catch (err) {
            console.error("❌ Error in game loop:", err);
        }
    }, 1000);
}

async function createNewGame(io) {
    if (!isServer || gameState.isProcessing) return;

    gameState.isProcessing = true;

    try {
        if (gameState.gameId) {
            
            console.log(`🏁 Ending Game ${gameState.gameId}...`);
            console.log("🧪 gameId type:", typeof gameState.gameId, gameState.gameId);

            await distributePrizePool(io,gameState.gameId);
        }

        gameState.timer = 59;
        gameState.winningNumber = generateWinningNumber();

        await db.query(`UPDATE games SET status = 'finished' WHERE status = 'ongoing'`);

        const [result] = await db.query(
            `INSERT INTO games (winning_num, prize_pool, status, created_at) VALUES (?, 20, 'ongoing', NOW())`,
            [gameState.winningNumber]
        );

        gameState.gameId = result.insertId;
        gameState.prizePool = 20;

        console.log(`✅ New game created (ID: ${gameState.gameId}) with winning number: ${gameState.winningNumber} and prize pool: ${gameState.prizePool}`);

        io.emit("new_game", {
            status: "success",
            message: `New game created successfully (ID: ${gameState.gameId}).`,
            gameId: gameState.gameId,
            prizePool: gameState.prizePool,
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
        const [previousGame] = await db.query(
            `SELECT id, prize_pool FROM games WHERE status = 'finished' ORDER BY id DESC LIMIT 1`
        );

        if (previousGame.length > 0) {
            const previousPrizePool = previousGame[0].prize_pool;

            if (previousPrizePool > 0) {
                await db.query(
                    `UPDATE games SET prize_pool = prize_pool + ? WHERE id = ?`,
                    [previousPrizePool, gameState.gameId]
                );

                gameState.prizePool += previousPrizePool;

                console.log(`🏆 Carried over ${previousPrizePool} coins to game ${gameState.gameId}`);

                io.emit("prize_pool_update", {
                    status: "success",
                    message: `Prize pool updated to ${gameState.prizePool} coins.`,
                    gameId: gameState.gameId,
                    prizePool: gameState.prizePool
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
    return gameState;
}

function generateWinningNumber() {
    let numbers = new Set();

    while (numbers.size < 3) {
        numbers.add(Math.floor(Math.random() * 11) + 1);
    }

    return Array.from(numbers).join('-');
}
