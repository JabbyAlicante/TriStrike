import db from "../config/db.js";
import { deductBalance } from "./balanceService.js"; 
import { getTotalPrizePool } from "./prizeService.js";  

export function placeBet(userId, gameId, chosenNumbers, io) {
    const chosenNumsString = chosenNumbers.join("-");
    const betAmount = 20;

    console.log(`🎲 User ${userId} is placing a bet of ${betAmount} on Game ${gameId}`);

    if (betAmount <= 0) {
        console.warn(`⚠ Invalid bet amount: ${betAmount}`);
        io.to(userId).emit("bet_failed", { message: "Invalid bet amount!" });
        return;
    }

    // Check if the game is still ongoing
    db.query(`SELECT id FROM games WHERE id = ? AND status = 'ongoing'`, [gameId], (err, results) => {
        if (err || results.length === 0) {
            console.error("❌ Bet failed: Invalid or finished game", gameId);
            io.to(userId).emit("bet_failed", { message: "Invalid or finished game!" });
            return;
        }

        // Deduct balance
        deductBalance(userId, betAmount, (err, newBalance) => {
            if (err) {
                console.error("❌ Bet failed: Error deducting balance", err);
                io.to(userId).emit("bet_failed", { message: "Insufficient balance or deduction error!" });
                return;
            }

            console.log(`💰 Balance deducted. New balance for User ${userId}: ${newBalance}`);

            db.getConnection((err, connection) => {
                if (err) {
                    console.error("❌ Database connection error:", err);
                    io.to(userId).emit("bet_failed", { message: "Database connection error!" });
                    return;
                }

                connection.beginTransaction(err => {
                    if (err) {
                        return rollbackTransaction(connection, io, userId, "Transaction error!", err);
                    }

                    connection.query(
                        `INSERT INTO bets (user_id, game_id, chosen_nums, amount) VALUES (?, ?, ?, ?)`, 
                        [userId, gameId, chosenNumsString, betAmount], 
                        (err) => {
                            if (err) {
                                return rollbackTransaction(connection, io, userId, "Error placing bet!", err);
                            }

                            getTotalPrizePool(gameId, betAmount, (err) => {
                                if (err) {
                                    return rollbackTransaction(connection, io, userId, "Error updating prize pool!", err);
                                }

                                connection.commit(err => {
                                    if (err) {
                                        return rollbackTransaction(connection, io, userId, "Error committing transaction!", err);
                                    }

                                    console.log(`✅ Bet placed successfully by User ${userId} on Game ${gameId}`);
                                    connection.release();
                                    io.to(userId).emit("bet_success", { balance: newBalance });
                                });
                            });
                        }
                    );
                });
            });
        });
    });
}

function rollbackTransaction(connection, io, userId, message, err) {
    console.error(`❌ ${message}`, err);
    connection.rollback(() => {
        connection.release();
        io.to(userId).emit("bet_failed", { message });
    });
}
