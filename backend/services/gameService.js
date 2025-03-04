import db from "../config/db.js";

let gameState = {
    timer: 59,
    winningNumber: generateWinningNumber(),
    gameId: null,
};

export function initializeGameState() {
    db.query(
        `SELECT id, winning_num, TIMESTAMPDIFF(SECOND, created_at, NOW()) AS elapsed 
        FROM games WHERE status = 'ongoing' ORDER BY id DESC LIMIT 1`, 
    (err, results) => {
        if (err || results.length === 0) {
            console.warn("⚠ No active game found. Creating a new one.");
            createNewGame();
        } else {
            let elapsed = results[0].elapsed || 0;
            gameState = {
                gameId: results[0].id,
                timer: Math.max(0, 59 - elapsed),
                winningNumber: results[0].winning_num,
            };
            console.log(`✅ Loaded active game: ID=${gameState.gameId}, Timer=${gameState.timer}`);
        }
    });
}

export function startGameService(io) {
    setInterval(() => {
        if (gameState.timer > 0) {
            gameState.timer--;
        } else {
            console.log("⏳ Timer reached 0. Creating new game...");
            createNewGame();
        }

        console.log(`🕒 Timer: ${gameState.timer} | 🎰 Winning Number: ${gameState.winningNumber}`);

        io.to("authenticated").emit("game_update", gameState);
    }, 1000);
}

function createNewGame() {
    gameState.timer = 59;
    gameState.winningNumber = generateWinningNumber();

    db.query(`UPDATE games SET status = 'finished' WHERE TRIM(status) = 'ongoing'`);
    
    db.query(`INSERT INTO games (winning_num, prize_pool, status) VALUES (?, 20, 'ongoing')`, 
        [gameState.winningNumber], (err, result) => {
            if (!err) {
                gameState.gameId = result.insertId;
                console.log(`✅ New game started (ID: ${gameState.gameId})`);
            } else {
                console.error("❌ Database error while inserting game:", err);
            }
        });
}

export function getGameState(callback) {
    callback(gameState);
}

function generateWinningNumber() {
    return Math.floor(Math.random() * 9) + 1; 
}
