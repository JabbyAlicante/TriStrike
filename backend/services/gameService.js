import { checkGameResults } from "./betsService.js";
import db from "../config/db.js";

let timer = 59;
let winningNumber = generateWinningNumber(); 

export function startGameService(io) {
    function gameRound() {
        if (timer > 0) {
            timer--;
            io.emit("game_update", { timer, winningNumber });
            setTimeout(gameRound, 1000);
        } else {
            
            timer = 59;
            winningNumber = generateWinningNumber();
            console.log(":)))) New Winning Number:", winningNumber);

            // Save the winning number to db
            db.query(`INSERT INTO games (winning_num) VALUES (?)`, [winningNumber], (err, result) => {
                if (err) console.error("❌ Database error:", err);
                else checkGameResults(result.insertId, winningNumber);
            });

            //broadcast to server
            io.emit("game_update", { timer, winningNumber });
            setTimeout(gameRound, 1000);
        }
    }

    gameRound(); 
}

export function getGameState() {
    return { timer, winningNumber };
}

function generateWinningNumber() {
    return Math.floor(Math.random() * 9) + 1; 
}
