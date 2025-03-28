import db from "../config/db.js";
import { deductBalance, addPrizeToWinner } from "./balanceService.js";
import { getTotalPrizePool } from "./prizeService.js";

export async function placeBet(socket, gameId, chosenNumbers, betAmount, user) {
    try {
        if (!user?.id) throw new Error("UNAUTHORIZED");

        const userId = user.id;

        if (!gameId || !chosenNumbers || chosenNumbers.length !== 3) {
            return socket.emit("bet_failed", {
                success: false,
                code: "INVALID_INPUT",
                message: "Invalid bet details. Please try again."
            });
        }

        const chosenNumsString = chosenNumbers.join("-");

        console.log(`🎲 User ${userId} is placing a bet of ${betAmount} on Game ${gameId}`);

        if (betAmount <= 0) {
            console.warn(`⚠ Invalid bet amount: ${betAmount}`);
            return socket.emit("bet_failed", {
                success: false,
                code: "INVALID_BET_AMOUNT",
                message: `Invalid bet amount: ${betAmount}`
            });
        }

        const [[game]] = await db.query(
            `SELECT id, winning_num, prize_pool FROM games WHERE id = ? AND status = 'ongoing'`,
            [gameId]
        );

        if (!game) {
            console.error("❌ Bet failed: Invalid or finished game", gameId);
            return socket.emit("bet_failed", {
                success: false,
                code: "GAME_NOT_FOUND",
                message: "Invalid or finished game!"
            });
        }

        const prizePool = game.prize_pool;

        const newBalance = await deductBalance(userId, betAmount);
        console.log(`💰 Balance deducted. New balance for User ${userId}: ${newBalance}`);

        await db.query(
            `INSERT INTO bets (user_id, game_id, chosen_nums, amount) VALUES (?, ?, ?, ?)`,
            [userId, gameId, chosenNumsString, betAmount]
        );

        await getTotalPrizePool(socket, gameId);

        const winningCombination = game.winning_num.split('-').map(Number);
        const chosenCombination = chosenNumbers.map(Number);

        const isWinningBet = winningCombination.every(
            (num, i) => num === chosenCombination[i]
        );

        if (isWinningBet) {

            const rewardAmount = prizePool;
            const updatedBalance = await addPrizeToWinner(userId, rewardAmount);

            console.log(`🏆 Bet WON! Reward: ${rewardAmount} coins`);

            await db.query(
                `UPDATE games SET prize_pool = 80 WHERE id = ?`,
                [gameId]
            );

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
            console.log(`💔 Bet LOST. Better luck next time!`);

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

        if (err.message === 'USER_NOT_FOUND') {
            return socket.emit("bet_failed", {
                success: false,
                code: "USER_NOT_FOUND",
                message: "User not found."
            });
        } 
        if (err.message === 'INSUFFICIENT_BALANCE') {
            return socket.emit("bet_failed", {
                success: false,
                code: "INSUFFICIENT_BALANCE",
                message: "You do not have enough balance to place this bet."
            });
        } 

        socket.emit("bet_failed", {
            success: false,
            code: "BET_ERROR",
            message: "An error occurred while placing your bet. Please try again later."
        });
    }
}
