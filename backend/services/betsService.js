import db from "../config/db.js";

export function placeBet(userId, gameId, chosenNumbers) {
    const chosenNumsString = chosenNumbers.join("-");

    const query = `INSERT INTO bets (user_id, game_id, chosen_nums) VALUES (?, ?, ?)`; 
    db.query(query, [userId, gameId, chosenNumsString], (err, result) => {
        if (err) {
            console.error("❌ Error placing bet:", err);
        } else {
            console.log("✅ Bet placed successfully for User ID:", userId);
        }
    });
}

export function checkGameResults(gameId, winningNumber) {
    const query = `SELECT id, user_id, chosen_nums FROM bets WHERE game_id = ?`;

    db.query(query, [gameId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching bets:", err);
            return;
        }

        results.forEach((bet) => {
            const chosenNumbers = bet.chosen_nums.split("-").map(Number);
            const isWinner = chosenNumbers.every(num => num === winningNumber); 

            console.log(`User ${bet.user_id} chose: ${bet.chosen_nums}, ${isWinner ? "🏆 Winner!" : "❌ Lost"}`);

            db.query(`UPDATE bets SET is_winner = ? WHERE id = ?`, [isWinner ? 1 : 0, bet.id]);

            if (isWinner) {
                db.query(`UPDATE users SET balance = balance + 100 WHERE id = ?`, [bet.user_id]);
            }
        });
    });
}
