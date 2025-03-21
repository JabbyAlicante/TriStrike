import db from "../config/db.js";
import { deductBalance, addPrizeToWinner } from "./balanceService.js";
import { getTotalPrizePool } from "./prizeService.js";

const WIN_MULTIPLIER = 5;

export async function placeBet(socket, userId, gameId, chosenNumbers) {
    if (!userId || !gameId || !chosenNumbers || chosenNumbers.length !== 3) {
        socket.emit("bet_failed", {
            success: false,
            code: "INVALID_INPUT",
            message: "Invalid bet details. Please try again."
        });
        return;
    }

    const chosenNumsString = chosenNumbers.join("-");
    const betAmount = 20;

    console.log(`🎲 User ${userId} is placing a bet of ${betAmount} on Game ${gameId}`);

    if (betAmount <= 0) {
        console.warn(`⚠ Invalid bet amount: ${betAmount}`);
        socket.emit("bet_failed", {
            success: false,
            code: "INVALID_BET_AMOUNT",
            message: `Invalid bet amount: ${betAmount}`
        });
        return;
    }

    try {
        const [[game]] = await db.query(
            `SELECT id, winning_num FROM games WHERE id = ? AND status = 'ongoing'`,
            [gameId]
        );

        if (!game) {
            console.error("❌ Bet failed: Invalid or finished game", gameId);
            socket.emit("bet_failed", {
                success: false,
                code: "GAME_NOT_FOUND",
                message: "Invalid or finished game!"
            });
            return;
        }

        const newBalance = await deductBalance(userId, betAmount);
        console.log(`💰 Balance deducted. New balance for User ${userId}: ${newBalance}`);

        await db.query(
            `INSERT INTO bets (user_id, game_id, chosen_nums, amount) VALUES (?, ?, ?, ?)`, 
            [userId, gameId, chosenNumsString, betAmount]
        );

        await getTotalPrizePool(socket, gameId);

        const winningCombination = game.winning_num.split('-').map(Number);
        const chosenCombination = chosenNumbers.map(Number);

        console.log(`🎯 Winning Combination: ${winningCombination}`);
        console.log(`🎯 Chosen Combination: ${chosenCombination}`);

        const isWinningBet = winningCombination.every(
            (num, i) => num === chosenCombination[i]
        );

        if (isWinningBet) {
            console.log(`🏆 User ${userId} WON!`);

            const rewardAmount = betAmount * WIN_MULTIPLIER;
            const updatedBalance = await addPrizeToWinner(userId, rewardAmount);

            console.log(`💰 User ${userId} rewarded with ${rewardAmount}. New balance: ${updatedBalance}`);

            socket.emit("bet_success", {
                success: true,
                code: "BET_WON",
                message: `Congratulations! You won ${rewardAmount} coins!`,
                balance: updatedBalance,
                win: true,
                prize: rewardAmount,
                userId
            });
        } else {
            console.log(`❌ User ${userId} lost.`);
            socket.emit("bet_success", {
                success: true,
                code: "BET_LOST",
                message: "Better luck next time!",
                balance: newBalance,
                win: false,
                userId
            });
        }
    } catch (err) {
        console.error("❌ Error placing bet:", err);

        if (err.code === 'INSUFFICIENT_BALANCE') {
            socket.emit("bet_failed", {
                success: false, 
                code: "INSUFFICIENT_BALANCE", 
                message: "You do not have enough balance to place this bet."
            });
        } else if (err.code === 'INVALID_GAME') {
            socket.emit("bet_failed", {
                success: false, 
                code: "INVALID_GAME", 
                message: "The game you are trying to bet on is not available."
            });
        } else {
            socket.emit("bet_failed", {
                success: false, 
                code: "BET_ERROR", 
                message: "An error occurred while placing your bet. Please try again later."
            });
        }
    }
}
