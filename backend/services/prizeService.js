import db from "../config/db.js";

export function getTotalPrizePool(gameId, callback) {
    db.query(`SELECT prize_pool FROM games WHERE id = ?`, [gameId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching prize pool:", err);
            if (typeof callback === "function") callback(0); 
            return;
        }

        if (typeof callback === "function") {
            callback(results.length > 0 ? results[0].prize_pool : 0);
        }
    });
}


export function updatePrizePool(gameId, amount, callback) {
    if (typeof gameId !== "number" || typeof amount !== "number") {
        console.error("❌ Invalid parameters:", { gameId, amount });
        return callback(new Error("Invalid gameId or amount"));
    }

    db.query(`UPDATE games SET prize_pool = prize_pool + ? WHERE id = ?`, [amount, gameId], (err) => {
        if (err) {
            console.error("❌ Error updating prize pool:", err);
            return callback(err);
        }
        callback(null);
    });
}
