import db from "../config/db.js";

// Get user balance
export function getUserBalance(userId, callback) {
    console.log(`💰 Fetching balance for User ID: ${userId}`);

    db.query(`SELECT balance FROM users WHERE id = ?`, [userId], (err, result) => {
        if (err) {
            console.error("❌ Error fetching balance:", err);
            return callback(err, null);
        }

        if (result.length === 0) {
            console.warn(`⚠ User ID ${userId} not found.`);
            return callback("User not found", null);
        }

        console.log(`✅ User ${userId} balance: ${result[0].balance}`);
        callback(null, result[0].balance);
    });
}

// Deduct balance 
export function deductBalance(userId, amount, callback) {
    console.log(`🛠 deductBalance() CALLED! Amount: ${amount}, User ID: ${userId}`);
    
    if (amount <= 0) {
        console.warn(`⚠ Invalid deduction amount: ${amount}`);
        return callback("Invalid deduction amount", null);
    }

    db.query(`SELECT balance FROM users WHERE id = ? FOR UPDATE`, [userId], (err, results) => {
        if (err || results.length === 0) {
            console.error("❌ Error fetching balance:", err);
            return callback("User not found", null);
        }

        const currentBalance = results[0].balance;
        console.log(`💰 Current Balance for User ${userId}: ${currentBalance}`);

        if (currentBalance < amount) {
            console.warn(`⚠ User ${userId} has insufficient balance.`);
            return callback("Insufficient balance", null);
        }

        db.query(
            `UPDATE users SET balance = balance - ? WHERE id = ?`, 
            [amount, userId], 
            (err, result) => {
                if (err) {
                    console.error("❌ Error deducting balance:", err);
                    return callback(err, null);
                }

                console.log(`✅ FINAL DEDUCTION: ${amount} deducted from User ${userId}`);
                getUserBalance(userId, callback);
            }
        );
    });
}


// Add prize 
export function addPrizeToWinner(userId, gameId, prizeAmount, callback) {
    console.log(`🏆 Adding prize of ${prizeAmount} to User ID: ${userId} for Game ID: ${gameId}`);

    db.query(
        `UPDATE users SET balance = balance + ? WHERE id = ?`, 
        [prizeAmount, userId], 
        (err) => {
            if (err) {
                console.error("❌ Error adding prize:", err);
                return callback(err, null);
            }

            console.log(`✅ Prize of ${prizeAmount} added to User ${userId} for Game ${gameId}`);
            getUserBalance(userId, callback); 
        }
    );
}
