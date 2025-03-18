import db from "../config/db.js";
import { deductBalance, addPrizeToWinner } from "./balanceService.js";
import { getTotalPrizePool } from "./prizeService.js";

export async function placeBet(userId, gameId, chosenNumbers) {
    const chosenNumsString = chosenNumbers.join("-");
    const betAmount = 20;

    console.log(`🎲 User ${userId} is placing a bet of ${betAmount} on Game ${gameId}`);

    if (betAmount <= 0) {
        console.warn(`⚠ Invalid bet amount: ${betAmount}`);
        return { 
            success: false, 
            code: "INVALID_BET_AMOUNT", 
            message: `Invalid bet amount: ${betAmount}` 
        };
    }

    try {
        // ✅ Check if the game exists and is ongoing
        const [game] = await db.query(
            `SELECT id, winning_num FROM games WHERE id = ? AND status = 'ongoing'`,
            [gameId]
        );

        if (!game) {
            console.error("❌ Bet failed: Invalid or finished game", gameId);
            return { 
                success: false, 
                code: "GAME_NOT_FOUND", 
                message: "Invalid or finished game!" 
            };
        }

        const winningCombination = game.winning_num.split('-').map(Number);

        // ✅ Deduct balance
        const newBalance = await deductBalance(userId, betAmount);
        console.log(`💰 Balance deducted. New balance for User ${userId}: ${newBalance}`);

        // ✅ Insert bet into database
        await db.query(
            `INSERT INTO bets (user_id, game_id, chosen_nums, amount) VALUES (?, ?, ?, ?)`, 
            [userId, gameId, chosenNumsString, betAmount]
        );

        // ✅ Update the prize pool
        await getTotalPrizePool(gameId, betAmount);

        const chosenCombination = chosenNumbers.map(Number);

        console.log(`🎯 Winning Combination: ${winningCombination}`);
        console.log(`🎯 Chosen Combination: ${chosenCombination}`);

        if (JSON.stringify(winningCombination) === JSON.stringify(chosenCombination)) {
            console.log(`🏆 User ${userId} WON!`);

            // ✅ 2x reward for a win
            const rewardAmount = betAmount * 2;

            const updatedBalance = await addPrizeToWinner(userId, rewardAmount);
            console.log(`💰 User ${userId} rewarded with ${rewardAmount}. New balance: ${updatedBalance}`);

            return { 
                success: true,
                code: "BET_WON",
                message: `Congratulations! You won ${rewardAmount} coins!`,
                balance: updatedBalance,
                win: true,
                prize: rewardAmount
            };
        } else {
            console.log(`❌ User ${userId} lost.`);
            return { 
                success: true,
                code: "BET_LOST",
                message: "Better luck next time!",
                balance: newBalance,
                win: false
            };
        }
    } catch (err) {
        console.error("❌ Error placing bet:", err);

        // ✅ Return specific error message based on the context
        if (err.code === 'INSUFFICIENT_BALANCE') {
            return { 
                success: false, 
                code: "INSUFFICIENT_BALANCE", 
                message: "You do not have enough balance to place this bet." 
            };
        } else if (err.code === 'INVALID_GAME') {
            return { 
                success: false, 
                code: "INVALID_GAME", 
                message: "The game you are trying to bet on is not available." 
            };
        } else {
            return { 
                success: false, 
                code: "BET_ERROR", 
                message: "An error occurred while placing your bet. Please try again later." 
            };
        }
    }
}
