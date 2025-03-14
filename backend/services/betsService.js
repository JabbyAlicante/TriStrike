import db from "../config/db.js";
import { deductBalance, addPrizeToWinner } from "./balanceService.js"; 
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
    db.query(`SELECT id, winning_num FROM games WHERE id = ? AND status = 'ongoing'`, [gameId], (err, results) => {
        if (err || results.length === 0) {
            console.error("❌ Bet failed: Invalid or finished game", gameId);
            io.to(userId).emit("bet_failed", { message: "Invalid or finished game!" });
            return;
        }

        const winningCombination = results[0].winning_num.split('-').map(Number);

        // Deduct balance
        deductBalance(userId, betAmount, (err, newBalance) => {
            if (err) {
                console.error("❌ Bet failed: Error deducting balance", err);
                io.to(userId).emit("bet_failed", { message: "Insufficient balance or deduction error!" });
                return;
            }

            console.log(`💰 Balance deducted. New balance for User ${userId}: ${newBalance}`);

            db.query(
                `INSERT INTO bets (user_id, game_id, chosen_nums, amount) VALUES (?, ?, ?, ?)`, 
                [userId, gameId, chosenNumsString, betAmount], 
                (err) => {
                    if (err) {
                        console.error("❌ Error placing bet:", err);
                        io.to(userId).emit("bet_failed", { message: "Error placing bet!" });
                        return;
                    }

                    // Update the prize pool
                    getTotalPrizePool(gameId, betAmount, (err) => {
                        if (err) {
                            console.error("❌ Error updating prize pool:", err);
                            io.to(userId).emit("bet_failed", { message: "Error updating prize pool!" });
                            return;
                        }

                        // Check if the bet matches the winning combination
                        const chosenCombination = chosenNumbers.map(Number);

                        console.log(`🎯 Winning Combination: ${winningCombination}`);
                        console.log(`🎯 Chosen Combination: ${chosenCombination}`);

                        if (JSON.stringify(winningCombination) === JSON.stringify(chosenCombination)) {
                            console.log(`🏆 User ${userId} WON!`);

                            //  5x reward for a win
                            const rewardAmount = betAmount * 2;
                            addPrizeToWinner(userId, rewardAmount, (err, updatedBalance) => {
                                if (!err) {
                                    console.log(`💰 User ${userId} rewarded with ${rewardAmount}. New balance: ${updatedBalance}`);
                                    io.to(userId).emit("bet_success", { 
                                        balance: updatedBalance, 
                                        win: true, 
                                        prize: rewardAmount 
                                    });
                                } else {
                                    console.error("❌ Error updating balance after win:", err);
                                }
                            });
                        } else {
                            console.log(`❌ User ${userId} lost.`);
                            io.to(userId).emit("bet_success", { balance: newBalance, win: false });
                        }
                    });
                }
            );
        });
    });
}


// function rollbackTransaction(connection, io, userId, message, err) {
//     console.error(`❌ ${message}`, err);
//     connection.rollback(() => {
//         connection.release();
//         io.to(userId).emit("bet_failed", { message });
//     });
// }
