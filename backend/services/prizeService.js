import db from "../config/db.js";
import { addPrizeToWinner } from "./balanceService.js";

export function getTotalPrizePool(gameId, callback) {
    db.query(
        `SELECT SUM(amount) AS total_prize_pool FROM bets WHERE game_id = ?`,
        [gameId],
        (err, results) => {
            if (err) {
                console.error("❌ Error fetching total prize pool:", err);
                return callback(err, null);
            }

            const totalPrizePool = results[0]?.total_prize_pool || 0;
            console.log(`💰 Total prize pool for Game ${gameId}: ${totalPrizePool}`);

            updatePrizePoolInGame(gameId, totalPrizePool, callback);
        }
    );
}


// to distribute prize among winners
export function distributePrizePool(gameId, callback) {
    console.log(`🔍 Checking for winners in Game ${gameId}`);

    db.query(
        `UPDATE bets b
         JOIN games g ON b.game_id = g.id
         SET b.is_winner = 1
         WHERE b.game_id = ? 
         AND JSON_CONTAINS(JSON_ARRAY(g.winning_num), JSON_ARRAY(b.chosen_nums))`, 
        [gameId],
        (err, result) => {
            if (err) {
                console.error("❌ Error updating winners:", err);
                return callback(err);
            }

            console.log(`✅ Updated winning bets: ${result.affectedRows} users marked as winners.`);

            // Fetch total prize pool
            db.query(`SELECT SUM(amount) AS total_prize_pool FROM bets WHERE game_id = ?`, [gameId], (err, results) => {
                if (err) {
                    console.error("❌ Error fetching prize pool:", err);
                    return callback(err);
                }

                const totalPrizePool = results[0]?.total_prize_pool || 0;
                console.log(`💰 Total prize pool for Game ${gameId}: ${totalPrizePool}`);

                // Fetch winners
                db.query(`SELECT user_id FROM bets WHERE game_id = ? AND is_winner = 1`, [gameId], (err, winners) => {
                    if (err) {
                        console.error("❌ Error fetching winners:", err);
                        return callback(err);
                    }

                    if (winners.length === 0) {
                        console.log(`⚠ No winners for Game ${gameId}. Carrying over prize pool.`);
                        storeCarryOverPrize(totalPrizePool);
                        return callback(null, "No winners. Prize carried over.");
                    }

                    const prizePerWinner = Math.floor(totalPrizePool / winners.length);
                    console.log(`🏆 Splitting ${totalPrizePool} among ${winners.length} winners (Each gets ${prizePerWinner})`);

                    const connection = db;
                    connection.beginTransaction(err => {
                        if (err) {
                            console.error("❌ Error starting transaction:", err);
                            return callback(err);
                        }

                        const prizePromises = winners.map(({ user_id }) => {
                            return new Promise((resolve, reject) => {
                                addPrizeToWinner(user_id, gameId, prizePerWinner, (err) => {
                                    if (err) {
                                        console.error(`❌ Error adding prize to User ${user_id}:`, err);
                                        return reject(err);
                                    }
                                    resolve();
                                });
                            });
                        });

                        Promise.all(prizePromises)
                            .then(() => {
                                connection.commit(err => {
                                    if (err) {
                                        console.error("❌ Error committing transaction:", err);
                                        return connection.rollback(() => callback(err));
                                    }
                                    console.log(`✅ All winners paid for Game ${gameId}`);
                                    callback(null, "Prizes distributed.");
                                });
                            })
                            .catch(err => {
                                connection.rollback(() => {
                                    console.error("❌ Transaction rolled back due to error:", err);
                                    callback(err);
                                });
                            });
                    });
                });
            });
        }
    );
}


function updatePrizePoolInGame(gameId, prizePool, callback) {
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


// Function to carry over the prize if no winners exist
function storeCarryOverPrize(amount) {
    db.query(`SELECT prize_pool FROM games WHERE status = 'ongoing' LIMIT 1`, (err, results) => {
        if (err) {
            console.error("❌ Error fetching ongoing game prize pool:", err);
            return;
        }

        const currentPrizePool = results[0]?.prize_pool || 0;
        const newPrizePool = currentPrizePool + amount;

        db.query(`UPDATE games SET prize_pool = ? WHERE status = 'ongoing'`, [newPrizePool], (err) => {
            if (err) {
                console.error("❌ Error updating carry-over prize pool:", err);
            } else {
                console.log(`🔄 Carry-over prize added! New Prize Pool: ${newPrizePool}`);
            }
        });
    });
}

