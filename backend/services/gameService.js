import { checkGameResults } from "../services/betsService.js";
import db from "../config/db.js";

let timer = 59;
let winningNumber = generateWinningNumber();

export function startGameService(io) {
    setInterval(() => {
        if (timer > 0) {
            timer--;
            io.emit("game_update", { timer, winningNumber });
            console.log(`🕒 Timer: ${timer}`); // NEW LOG
        } else {
            console.log("⏳ Timer reached 0. Creating new game..."); // NEW LOG
            timer = 59;
            winningNumber = generateWinningNumber();
        

            // Mark previous game as completed
            db.query(`UPDATE games SET status = 'finished' WHERE TRIM(status) = 'ongoing'`, (err, result) => {
                if (err) {
                    console.error("❌ Error updating previous game status:", err);
                } else {
                    console.log(`✅ Updated previous game status (${result.affectedRows} games finished)`);
                }
            });
            
            
            

            // Start a new game
            
            db.query(`INSERT INTO games (winning_num, prize_pool, status) VALUES (?, 20, 'ongoing')`, 
                [winningNumber], (err, result) => {
                    if (err) {
                        console.error("❌ Database error while inserting game:", err);
                    } else {
                        console.log(`✅ New game started (ID: ${result.insertId})`);
                    }
                });


            io.emit("game_update", { timer, winningNumber });
        }
    }, 1000);
}

// Fetch latest game state if server restarts
export function getGameState(callback) {
    db.query(
        `SELECT id, winning_num, TIMESTAMPDIFF(SECOND, created_at, NOW()) AS elapsed 
        FROM games WHERE status = 'ongoing' ORDER BY id DESC LIMIT 1`, 
    (err, results) => {
        if (err || results.length === 0) {
            console.error("Error fetching game state:", err || "No active game found");
            return callback({ timer: 59, winningNumber: generateWinningNumber(), gameId: null });
        }

        let elapsed = results[0].elapsed || 0;
        let timer = Math.max(0, 59 - elapsed);
        
        console.log(`Active game found: ID=${results[0].id}, Winning Num=${results[0].winning_num}, Timer=${timer}`);

        callback({ 
            gameId: results[0].id,
            timer, 
            winningNumber: results[0].winning_num 
        });
    });
}


function generateWinningNumber() {
    return Math.floor(Math.random() * 9) + 1;
}
