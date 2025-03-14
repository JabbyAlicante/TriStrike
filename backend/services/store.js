import db from "../config/db.js";

export function strikeStore(user_id, amount, callback) {
    const query = "UPDATE users SET balance = balance + ? WHERE id = ?";
    
    db.query(query, [amount, user_id], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}
