// import db from "../config/db.js";
// import { markWinningBet, addPrizeToWinner } from "./prizeService.js";

// export function processGameResults(gameId, winningNumber) {
//     db.query(
//         `SELECT user_id, amount FROM bets WHERE game_id = ? AND chosen_nums = ?`, 
//         [gameId, winningNumber], 
//         (err, winners) => {
//             if (err) {
//                 console.error("❌ Error fetching winners:", err);
//                 return;
//             }

//             if (winners.length === 0) {
//                 console.log("🚫 No winners for this game.");
//                 return;
//             }

//             winners.forEach((winner) => {
//                 const userId = winner.user_id;
//                 const prizeAmount = winner.amount * 2; // Example prize logic

//                 markWinningBet(userId, gameId, (err) => {
//                     if (err) {
//                         console.error(`⚠️ Could not mark user ${userId} as winner.`);
//                     } else {
//                         addPrizeToWinner(userId, prizeAmount, (err) => {
//                             if (err) {
//                                 console.error(`⚠️ Failed to add prize for user ${userId}`);
//                             }
//                         });
//                     }
//                 });
//             });
//         }
//     );

//     // Mark the game as finished
//     db.query(`UPDATE games SET status = 'finished' WHERE id = ?`, [gameId], (err) => {
//         if (err) console.error("❌ Error updating game status:", err);
//     });
// }
