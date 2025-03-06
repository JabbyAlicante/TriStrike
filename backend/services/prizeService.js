import db from "../config/db.js";
import { addPrizeToWinner } from "./balanceService.js";

export function getTotalPrizePool(gameId, callback) {
    db.query(`SELECT SUM(amount) AS total_prize_pool FROM bets WHERE game_id = ?`, [gameId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching total prize pool:", err);
            return callback(err, null);
        }

        const totalPrizePool = results[0]?.total_prize_pool || 0;
        console.log(`💰 Total prize pool for Game ${gameId}: ${totalPrizePool}`);
        callback(null, totalPrizePool);
    });
}


// Function to distribute prize among winners
export function distributePrizePool(gameId, callback) {
    console.log(`🔍 Checking for winners in Game ${gameId}`);

    //Get total prize pool for the game
    db.query(`SELECT SUM(amount) AS total_prize_pool FROM bets WHERE game_id = ?`, [gameId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching prize pool:", err);
            return callback(err);
        }

        const totalPrizePool = results[0]?.total_prize_pool || 0;
        console.log(`💰 Total prize pool for Game ${gameId}: ${totalPrizePool}`);

        // Find all winners
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

            //Split prize among winners
            const prizePerWinner = Math.floor(totalPrizePool / winners.length); 
            console.log(`🏆 Splitting ${totalPrizePool} among ${winners.length} winners (Each gets ${prizePerWinner})`);

            let processedWinners = 0;
            const connection = db; 

            connection.beginTransaction(err => {
                if (err) {
                    console.error("❌ Error starting transaction:", err);
                    return callback(err);
                }

                winners.forEach(({ user_id }) => {
                    addPrizeToWinner(user_id, gameId, prizePerWinner, (err) => {
                        if (err) {
                            console.error(`❌ Error adding prize to User ${user_id}:`, err);
                            return connection.rollback(() => callback(err));
                        }

                        processedWinners++;

                        // If all winners have been processed, commit transaction
                        if (processedWinners === winners.length) {
                            connection.commit(err => {
                                if (err) {
                                    console.error("❌ Error committing transaction:", err);
                                    return connection.rollback(() => callback(err));
                                }

                                console.log(`✅ All winners paid for Game ${gameId}`);
                                callback(null, "Prizes distributed.");
                            });
                        }
                    });
                });
            });
        });
    });
}

// Store carryover prize in a separate place until a new game starts
function storeCarryOverPrize(amount) {
    db.query(
        `INSERT INTO carryover_prizes (amount) VALUES (?)`, 
        [amount], 
        (err) => {
            if (err) {
                console.error("❌ Error storing carryover prize:", err);
            } else {
                console.log(`💰 Carryover prize of ${amount} stored for the next game.`);
            }
        }
    );
}

// Apply carryover prize to the next game when it starts
export function applyCarryOverToNewGame(newGameId) {
    db.query(`SELECT SUM(amount) AS total_carryover FROM carryover_prizes`, (err, results) => {
        if (err || !results[0] || results[0].total_carryover === 0) {
            console.log("⚠ No carryover prize to apply.");
            return;
        }

        const carryoverAmount = results[0].total_carryover;

        db.query(`UPDATE games SET prize_pool = prize_pool + ? WHERE id = ?`, [carryoverAmount, newGameId], (err) => {
            if (err) {
                console.error("❌ Error applying carryover prize:", err);
            } else {
                console.log(`💰 Carryover prize of ${carryoverAmount} added to Game ${newGameId}`);
                db.query(`DELETE FROM carryover_prizes`, () => {}); 
            }
        });
    });
}
