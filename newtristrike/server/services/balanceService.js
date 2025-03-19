import db from "../config/db.js";
import { verifyToken } from "./userService.js";

export async function getUserBalance(socket, token) {
    const { success, user } = await verifyToken(token);
    if (!success) {
        socket.emit("balance_failed", {
            success: false,
            code: "INVALID_TOKEN",
            message: "Invalid or expired token"
        });
        return;
    }

    const userId = user.id;
    console.log(`💰 Fetching balance for User ID: ${userId}`);

    try {
        const [result] = await db.query(
            `SELECT username, balance FROM users WHERE id = ?`,
            [userId]
        );

        if (result.length === 0) {
            console.warn(`⚠ User ID ${userId} not found.`);
            socket.emit("balance_failed", {
                success: false,
                code: "USER_NOT_FOUND",
                message: "User not found",
                userId
            });
            return;
        }

        const { username, balance } = result[0];
        console.log(`✅ User ${username} (${userId}) balance: ${balance}`);

        socket.emit("balance_success", {
            success: true,
            userId,
            username,
            balance
        });
    } catch (err) {
        console.error(`❌ Error fetching balance for User ${userId}:`, err);

        socket.emit("balance_failed", {
            success: false,
            code: "BALANCE_FETCH_ERROR",
            message: "Error fetching balance",
            userId
        });
    }
}

export async function deductBalance(socket, token, amount) {
    if (amount <= 0) {
        console.warn(`⚠ Invalid deduction amount: ${amount}`);
        socket.emit("balance_failed", {
            success: false,
            code: "INVALID_DEDUCTION_AMOUNT",
            message: "Invalid deduction amount"
        });
        return;
    }

    const { success, user } = await verifyToken(token);
    if (!success) {
        socket.emit("balance_failed", {
            success: false,
            code: "INVALID_TOKEN",
            message: "Invalid or expired token"
        });
        return;
    }

    const userId = user.id;
    console.log(`🛠 deductBalance() CALLED! Amount: ${amount}, User ID: ${userId}`);

    try {
        const [results] = await db.query(
            `SELECT username, balance FROM users WHERE id = ? FOR UPDATE`,
            [userId]
        );

        if (results.length === 0) {
            console.warn(`⚠ User ${userId} not found.`);
            socket.emit("balance_failed", {
                success: false,
                code: "USER_NOT_FOUND",
                message: "User not found"
            });
            return;
        }

        const { username, balance: currentBalance } = results[0];
        console.log(`💰 Current Balance for User ${username} (${userId}): ${currentBalance}`);

        if (currentBalance < amount) {
            console.warn(`⚠ User ${username} has insufficient balance.`);
            socket.emit("balance_failed", {
                success: false,
                code: "INSUFFICIENT_BALANCE",
                message: "Insufficient balance",
                userId,
                username,
                balance: currentBalance
            });
            return;
        }

        await db.query(
            `UPDATE users SET balance = balance - ? WHERE id = ?`,
            [amount, userId]
        );

        const newBalance = await getBalance(userId);
        console.log(`✅ ${amount} deducted from User ${username} (${userId}). New balance: ${newBalance}`);

        socket.emit("balance_success", {
            success: true,
            userId,
            username,
            balance: newBalance,
            message: `Successfully deducted ${amount} coins.`
        });
    } catch (err) {
        console.error(`❌ Error deducting balance for User ${userId}:`, err);

        socket.emit("balance_failed", {
            success: false,
            code: "BALANCE_DEDUCTION_ERROR",
            message: "Error deducting balance"
        });
    }
}

export async function addPrizeToWinner(socket, userId, prizeAmount) {
    console.log(`🎯 Adding prize of ${prizeAmount} to User ID: ${userId}`);

    try {
        await db.query(
            `UPDATE users SET balance = balance + ? WHERE id = ?`,
            [prizeAmount, userId]
        );

        const newBalance = await getBalance(userId);
        const { username } = await getUserInfo(userId);

        console.log(`✅ User ${username} (${userId}) new balance: ${newBalance}`);

        socket.emit("prize_success", {
            success: true,
            userId,
            username,
            balance: newBalance,
            prizeAmount,
            message: `You won ${prizeAmount} coins!`
        });
    } catch (err) {
        console.error(`❌ Error adding prize to User ${userId}:`, err);

        socket.emit("prize_failed", {
            success: false,
            code: "PRIZE_ADDITION_ERROR",
            message: "Error adding prize"
        });
    }
}

async function getBalance(userId) {
    const [result] = await db.query(`SELECT balance FROM users WHERE id = ?`, [userId]);

    if (result.length === 0) {
        throw { code: "USER_NOT_FOUND", message: "User not found" };
    }

    return result[0].balance;
}

async function getUserInfo(userId) {
    const [result] = await db.query(
        `SELECT username FROM users WHERE id = ?`,
        [userId]
    );

    if (result.length === 0) {
        throw { code: "USER_NOT_FOUND", message: "User not found" };
    }

    return result[0];
}
