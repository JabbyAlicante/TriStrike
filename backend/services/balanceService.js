import db from "../config/db.js";

//update user balance
export function updateUserBalance(userId, amount, callback) {
    const sql = `UPDATE users SET balance = balance + ? WHERE id = ?`;
    db.query(sql, [amount, userId], (err, result) => {
        if (err) {
            console.error("Error updating balance:", err);
            return callback(err);
        }
        callback(null, result);
    });
}

// get user balance
export function getUserBalance(userId, callback) {
    const sql = `SELECT balance FROM users WHERE id = ?`;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching balance:", err);
            return callback(err, null);
        }
        callback(null, results[0]?.balance || 0);
        
    });
}
