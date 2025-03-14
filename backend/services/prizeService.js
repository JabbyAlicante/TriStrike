import db from "../config/db.js";
import { addPrizeToWinner } from "./balanceService.js";

export function getTotalPrizePool(gameId) {
    return new Promise((resolve, reject) => {
        if (!gameId) {
            console.log("⚠️ Missing game ID");
            return reject("Game ID is required");
        }

        db.query(
            "SELECT SUM(amount) AS totalPrizePool FROM bets WHERE game_id = ?",
            [gameId],
            (err, results) => {
                if (err) {
                    console.error("❌ Database error:", err);
                    return reject(err);
                }

                if (results.length > 0) {
                    const prizePool = results[0].totalPrizePool || 0;
                    console.log(`✅ Prize pool for game ${gameId}: ${prizePool}`);
                    return resolve(prizePool);
                } else {
                    console.log(`⚠️ No prize pool data found for game ${gameId}`);
                    return reject("No data found");
                }
            }
        );
    });
}

export async function distributePrizePool(gameId, callback) {
    console.log(`🔍 Checking for winners in Game ${gameId}`);

    try {
        // Identify winners correctly
        await new Promise((resolve, reject) => {
            db.query(
                `UPDATE bets b
                 JOIN games g ON b.game_id = g.id
                 SET b.is_winner = 1
                 WHERE b.game_id = ?
                 AND JSON_CONTAINS(
                     CAST(CONCAT('[', REPLACE(g.winning_num, '-', ','), ']') AS JSON),
                     CAST(CONCAT('[', REPLACE(b.chosen_nums, '-', ','), ']') AS JSON)
                 )`,
                [gameId],
                (err, result) => {
                    if (err) {
                        console.error("❌ Error updating winners:", err);
                        return reject(err);
                    }
                    console.log(`✅ Updated winning bets: ${result.affectedRows} users marked as winners.`);
                    resolve(result);
                }
            );
        });
        

        // Fetch total prize pool
        const totalPrizePool = await getTotalPrizePool(gameId);

        // Fetch winners
        const winners = await new Promise((resolve, reject) => {
            db.query(
                `SELECT user_id FROM bets WHERE game_id = ? AND is_winner = 1`,
                [gameId],
                (err, results) => {
                    if (err) {
                        console.error("❌ Error fetching winners:", err);
                        return reject(err);
                    }
                    resolve(results);
                }
            );
        });

        if (winners.length === 0) {
            console.log(`🔄 No winners, carrying over prize to next round.`);
            return storeCarryOverPrize(totalPrizePool, callback);
        }

        const prizePerWinner = Math.floor(totalPrizePool / winners.length);
        console.log(`🏆 Splitting ${totalPrizePool} among ${winners.length} winners (Each gets ${prizePerWinner})`);

        // Start a transaction to distribute prizes
        const connection = db;
        connection.beginTransaction(async (err) => {
            if (err) {
                console.error("❌ Error starting transaction:", err);
                return callback(err);
            }

            try {
                for (const { user_id } of winners) {
                    await new Promise((resolve, reject) => {
                        addPrizeToWinner(user_id, gameId, prizePerWinner, (err, updatedBalance) => {
                            if (err) {
                                console.error(`❌ Error adding prize to User ${user_id}:`, err);
                                return reject(err);
                            }
                            console.log(`✅ Prize distributed to User ID ${user_id}. New balance: ${updatedBalance}`);
                            resolve();
                        });
                    });
                }

                // Commit transaction after distributing all prizes
                connection.commit((err) => {
                    if (err) {
                        console.error("❌ Error committing transaction:", err);
                        return connection.rollback(() => callback(err));
                    }

                    console.log(`✅ All winners paid for Game ${gameId}`);

                    // Reset prize pool after distribution
                    updatePrizePoolInGame(gameId, 0, (err) => {
                        if (err) {
                            console.error("❌ Error updating prize pool to 0:", err);
                            return callback(err);
                        }
                        console.log(`✅ Prize pool set to 0 for Game ${gameId}`);
                        callback(null, "Prizes distributed successfully.");
                    });
                });
            } catch (err) {
                connection.rollback(() => callback(err));
            }
        });
    } catch (err) {
        console.error("❌ Error in prize distribution:", err);
        callback(err);
    }
}

export function updatePrizePoolInGame(gameId, prizePool, callback) {
    db.query(
        `UPDATE games SET prize_pool = ? WHERE id = ?`,
        [prizePool, gameId],
        (err, result) => {
            if (err) {
                console.error("❌ Error updating prize pool in games table:", err);
                return callback(err);
            }
            console.log(`✅ Prize pool updated for Game ${gameId}: ${prizePool}`);
            callback(null, prizePool);
        }
    );
}

export function storeCarryOverPrize(amount, callback) {
    db.query(
        `SELECT id FROM games ORDER BY created_at DESC LIMIT 1`,
        (err, result) => {
            if (err) {
                console.error("❌ Error fetching latest game:", err);
                return callback(err);
            }

            if (result.length === 0) {
                console.error("❌ No active games found for carryover.");
                return callback(new Error("No active game"));
            }

            const latestGameId = result[0].id;

            db.query(
                `UPDATE games SET prize_pool = prize_pool + ? WHERE id = ?`,
                [amount, latestGameId],
                (err) => {
                    if (err) {
                        console.error("❌ Error updating carry-over prize pool:", err);
                        return callback(err);
                    }

                    console.log(`🔄 Carry-over prize added! New Prize Pool for Game ${latestGameId}: +${amount}`);
                    callback(null, "Prize carried over");
                }
            );
        }
    );
}

