import db from "../config/db.js";

let gameState = { timeLeft: 59, winning_num: null, prizePool: 20 };
let gameTimerStarted = false; // Prevent multiple timers

export function startGameService(io) {
    if (gameTimerStarted) return; // Prevent duplicate timers
    gameTimerStarted = true;

    setInterval(async () => {
        gameState.timeLeft -= 1;
        console.log(`Game timer: ${gameState.timeLeft}s remaining`);

        if (gameState.timeLeft <= 0) {
            gameState.winning_num = Math.floor(Math.random() * 10);
            gameState.timeLeft = 59;

            console.log(`New Game! Winning Number: ${gameState.winning_num}`);

            try {
                await db.query(
                    "INSERT INTO games (winning_num, prize_pool) VALUES (?, ?)", 
                    [gameState.winning_num, gameState.prizePool]
                );
                console.log("Game round saved to database.");
            } catch (error) {
                console.error("Database insert error:", error);
            }
        }

        io.emit("game_update", gameState);
    }, 1000); 
}

export function getGameState() {
    return gameState;
}
