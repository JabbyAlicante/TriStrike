import db from "../config/db.js";
import { addPrizeToWinner } from "./balanceService.js";

export async function getTotalPrizePool(io, gameId) {
    if (!io) {
        console.error("❌ io is undefined in distributePrizePool");
        return;
    }

    if (!gameId) {
        console.log("⚠️ Missing game ID");
        io.emit("prize_pool_response", {
            success: false,
            code: "MISSING_GAME_ID",
            message: "Game ID is required"
        });
        return;
    }

    try {
        const [results] = await db.query(
            "SELECT SUM(amount) AS totalPrizePool FROM bets WHERE game_id = ?",
            [gameId]
        );

        if (results.length > 0) {
            const prizePool = results[0].totalPrizePool || 0;

            console.log(`✅ Prize pool for game ${gameId}: ${prizePool}`);

            io.emit("prize_pool_response", {
                success: true,
                gameId,
                prizePool,
                message: `Prize pool fetched successfully`
            });

            return prizePool;
        } else {
            console.log(`⚠️ No prize pool data found for game ${gameId}`);

            io.emit("prize_pool_response", {
                success: false,
                code: "NO_PRIZE_POOL_DATA",
                message: `No prize pool data found for game ${gameId}`
            });

            return 0;
        }
    } catch (err) {
        console.error(`❌ Error fetching prize pool for game ${gameId}:`, err);

        io.emit("prize_pool_response", {
            success: false,
            code: "PRIZE_POOL_FETCH_ERROR",
            message: "Error fetching prize pool",
            error: err.message
        });

        throw err;
    }
}


// export async function distributePrizePool(io, gameId) {
//     if (!gameId) {
//         io.emit("prize_distribution", {
//             success: false,
//             message: "Game ID is required",
//             data: null
//         });
//         return;
//     }

//     console.log(`🔍 Checking for winners in Game ${gameId}`);
//     io.emit("prize_distribution", {
//         success: true,
//         message: `Checking for winners in Game ${gameId}...`
//     });

//     try {
//         await db.query(
//             `UPDATE bets b
//              JOIN games g ON b.game_id = g.id
//              SET b.is_winner = 1
//              WHERE b.game_id = ?
//              AND JSON_CONTAINS(
//                  CAST(CONCAT('[', REPLACE(g.winning_num, '-', ','), ']') AS JSON),
//                  CAST(CONCAT('[', REPLACE(b.chosen_nums, '-', ','), ']') AS JSON)
//              )`,
//             [gameId]
//         );

//         const [prizeResult] = await db.query(
//             `SELECT SUM(amount) AS totalPrizePool FROM bets WHERE game_id = ?`,
//             [gameId]
//         );

//         const totalPrizePool = prizeResult[0]?.totalPrizePool || 0;

//         if (totalPrizePool === 0) {
//             console.log(`⚠️ No prize pool available for Game ${gameId}`);
//             io.emit("prize_distribution", {
//                 success: false,
//                 message: `No prize pool available for Game ${gameId}`,
//                 data: null
//             });
//             return;
//         }

//         const [winners] = await db.query(
//             `SELECT user_id FROM bets WHERE game_id = ? AND is_winner = 1`,
//             [gameId]
//         );

//         if (winners.length === 0) {
//             console.log(`🔄 No winners, carrying over prize to next round.`);
//             await storeCarryOverPrize(totalPrizePool, io);
//             return;
//         }

//         const prizePerWinner = Math.floor(totalPrizePool / winners.length);
//         console.log(
//             `🏆 Splitting ${totalPrizePool} among ${winners.length} winners (Each gets ${prizePerWinner})`
//         );

//         const connection = await db.getConnection();
//         await connection.beginTransaction();

//         try {
//             const winnerPromises = winners.map(({ user_id }) =>
//                 addPrizeToWinner(io, user_id, prizePerWinner)
//             );

//             await Promise.all(winnerPromises);

//             await connection.commit();

//             console.log(`✅ All winners paid for Game ${gameId}`);
//             io.emit("prize_distribution", {
//                 success: true,
//                 message: `Prizes distributed successfully!`,
//                 data: {
//                     gameId,
//                     totalPrizePool,
//                     totalWinners: winners.length,
//                     prizePerWinner
//                 }
//             });

//             await updatePrizePoolInGame(gameId, 0);
//         } catch (err) {
//             await connection.rollback();
//             console.error("❌ Error distributing prizes:", err);
//             io.emit("prize_distribution", {
//                 success: false,
//                 message: "Error distributing prizes",
//                 error: err.message
//             });
//         } finally {
//             connection.release();
//         }
//     } catch (err) {
//         console.error("❌ Error in prize distribution:", err);
//         io.emit("prize_distribution", {
//             success: false,
//             message: "Error processing prize pool",
//             error: err.message
//         });
//     }
// }

export async function updatePrizePoolInGame(gameId, prizePool) {
    try {
        await db.query(
            `UPDATE games SET prize_pool = ? WHERE id = ?`,
            [prizePool, gameId]
        );

        console.log(`✅ Prize pool updated for Game ${gameId}: ${prizePool}`);
    } catch (err) {
        console.error("❌ Error updating prize pool in games table:", err);
        throw err;
    }
}

// export async function storeCarryOverPrize(amount, io) {
//     try {
//         const [result] = await db.query(
//             `SELECT id FROM games ORDER BY created_at DESC LIMIT 1`
//         );

//         if (result.length === 0) {
//             throw new Error("No active game found for carryover");
//         }

//         const latestGameId = result[0].id;

//         await db.query(
//             `UPDATE games SET prize_pool = prize_pool + ? WHERE id = ?`,
//             [amount, latestGameId]
//         );

//         console.log(
//             `🔄 Carry-over prize added! New Prize Pool for Game ${latestGameId}: +${amount}`
//         );

//         io.emit("prize_distribution", {
//             success: true,
//             message: `Carry-over prize added to Game ${latestGameId}`,
//             data: {
//                 gameId: latestGameId,
//                 carryOverAmount: amount
//             }
//         });
//     } catch (err) {
//         console.error("❌ Error updating carry-over prize pool:", err);
//         io.emit("prize_distribution", {
//             success: false,
//             message: "Error carrying over prize",
//             error: err.message
//         });
//     }
// }
