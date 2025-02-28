import db from "../config/db.js";
import { updateUserBalance, getUserBalance } from "./balanceService.js";
import { updatePrizePool, getTotalPrizePool } from "./prizeService.js";  

export function placeBet(userId, gameId, chosenNumbers, io) {
    const chosenNumsString = chosenNumbers.join("-");
    const betAmount = 20;

    // Check if the game is still ongoing
    db.query(`SELECT id FROM games WHERE id = ? AND status = 'ongoing'`, [gameId], (err, results) => {
        if (err || results.length === 0) {
            console.error("❌ Invalid or finished game:", gameId);
            io.to(userId).emit("bet_failed", { message: "Invalid or finished game!" });
            return;
        }

        getUserBalance(userId, (err, userBalance) => {
            if (err || userBalance < betAmount) {
                console.log("❌ Insufficient balance for user:", userId);
                io.to(userId).emit("bet_failed", { message: "Insufficient balance!" });
                return;
            }

            db.beginTransaction(err => {
                if (err) {
                    console.error("❌ Error starting transaction:", err);
                    return;
                }

                updateUserBalance(userId, -betAmount, (err) => {
                    if (err) {
                        db.rollback();
                        io.to(userId).emit("bet_failed", { message: "Error deducting balance!" });
                        return;
                    }

                    db.query(`INSERT INTO bets (user_id, game_id, chosen_nums) VALUES (?, ?, ?)`, 
                        [userId, gameId, chosenNumsString], (err) => {
                        if (err) {
                            db.rollback();
                            console.error("❌ Error placing bet:", err);
                            return;
                        }

                        //  Update prize pool
                        getTotalPrizePool(gameId, betAmount, (err) => {
                            if (err) {
                                db.rollback();
                                io.to(userId).emit("bet_failed", { message: "Error updating prize pool!" });
                                return;
                            }

                            db.commit(err => {
                                if (err) {
                                    db.rollback();
                                    console.error("❌ Error committing transaction:", err);
                                } else {
                                    console.log("✅ Bet placed successfully.");
                                    io.to(userId).emit("update_balance", { balance: userBalance - betAmount });
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}

/**
 * Game Results
 */
const BASE_PRIZE_POOL = 20; 
export function checkGameResults(gameId, winningNumber, io) {
    db.query(`SELECT id, user_id, chosen_nums FROM bets WHERE game_id = ?`, [gameId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching bets:", err);
            return;
        }

        let winners = results.filter(bet => bet.chosen_nums.split("-").map(Number).includes(winningNumber));

        // Fetch the current prize pool
        getTotalPrizePool(gameId, (totalPrizePool) => {
            if (totalPrizePool === 0) {
                console.log("🏆 No prize pool available.");
                io.emit("game_result", { gameId, winningNumber, hasWinner: false });
                return;
            }

            if (winners.length > 0) {
                // If winners exist, split the prize pool
                let prizePerWinner = Math.floor(totalPrizePool / winners.length);

                let updatePromises = winners.map(winner => {
                    return new Promise((resolve, reject) => {
                        updateUserBalance(winner.user_id, prizePerWinner, (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    });
                });

                Promise.all(updatePromises)
                    .then(() => {
                        console.log(`🎉 Winners found! Prize per winner: ${prizePerWinner}`);

                        // Reset the prize pool to 20 coins for the next game
                        updatePrizePool(gameId, -totalPrizePool + BASE_PRIZE_POOL, (err) => {
                            if (err) console.error("❌ Error resetting prize pool:", err);
                        });

                        io.emit("game_result", { gameId, winningNumber, hasWinner: true, prizePerWinner });
                        io.emit("update_prize_pool", { gameId, totalPrizePool: BASE_PRIZE_POOL });
                    })
                    .catch(err => console.error("❌ Error distributing winnings:", err));
            } else {
                console.log("😢 No winners this round. Prize pool carries over!");

                // ✅ Carry over the prize pool
                io.emit("game_result", { gameId, winningNumber, hasWinner: false });
                io.emit("update_prize_pool", { gameId, totalPrizePool });
            }

            // ✅ Mark game as finished
            db.query(`UPDATE games SET status = 'finished' WHERE id = ?`, [gameId], (err) => {
                if (err) console.error("❌ Error updating game status:", err);
            });
        });
    });
}
