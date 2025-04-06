import {slavedb, masterdb} from "../config/db.js";

export async function getUserBalance(userId, socket) {
    console.log(`💰 Fetching balance for User ID: ${userId}`);

    try {
        const [results] = await slavedb.query(
            `SELECT id, username, balance FROM users WHERE id = ?`,
            [userId]
        );

        if (results.length === 0) {
            throw new Error("USER_NOT_FOUND");
        }

        const { id, username, balance } = results[0];
        console.log(`✅ User ${username} (ID: ${id}) balance: ${balance}`);

        socket.emit('balance-response', {
            userId: id,
            username,
            balance
        });
        console.log(`📢 Emitted balance update for User ID: ${userId}`);

        return { id, username, balance };
    } catch (err) {
        console.error(`❌ Error fetching balance:`, err);
        socket.emit('balance-response', { 
            success: false, 
            message: "Failed to fetch balance.", 
            error: err.message 
        });
    }
}

export async function deductBalance(userId, amount) {
    if (amount <= 0) throw new Error("INVALID_DEDUCTION_AMOUNT");

    console.log(`🛠 Deducting ${amount} coins from User ID: ${userId}`);

    let connection;
    try {
        connection = await slavedb.getConnection();
        await connection.beginTransaction();

        const [results] = await connection.query(
            `SELECT username, balance FROM users WHERE id = ? FOR UPDATE`,
            [userId]
        );

        if (results.length === 0) {
            await connection.rollback();
            throw new Error("USER_NOT_FOUND");
        }

        const { balance: currentBalance } = results[0];

        if (currentBalance < amount) {
            await connection.rollback();
            throw new Error("INSUFFICIENT_BALANCE");
        }

        await connection.query(
            `UPDATE users SET balance = balance - ? WHERE id = ?`,
            [amount, userId]
        );

        await connection.commit();

        const newBalance = currentBalance - amount;
        console.log(`✅ Deducted ${amount}. New balance: ${newBalance}`);

        return newBalance;
    } catch (err) {
        if (connection) await connection.rollback();
        console.error(`❌ Error deducting balance:`, err);
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

export async function addPrizeToWinner(userId, prizeAmount) {
    console.log(`🎯 Adding ${prizeAmount} coins to User ID: ${userId}`);

    let connection;
    try {
        connection = await masterdb.getConnection();
        await connection.beginTransaction();

        await connection.query(
            `UPDATE users SET balance = balance + ? WHERE id = ?`,
            [prizeAmount, userId]
        );

        const newBalance = await getBalance(userId);
        const user = await getUserInfo(userId);

        if (!user) {
            await connection.rollback();
            throw new Error("USER_NOT_FOUND");
        }

        console.log(`✅ User ${user.username} new balance: ${newBalance}`);

        await connection.commit();

        return {
            userId,
            username: user.username,
            balance: newBalance,
            prizeAmount
        };
    } catch (err) {
        if (connection) await connection.rollback();
        console.error(`❌ Error adding prize:`, err);
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

export async function getBalance(userId) {
    let connection;
    try {
        connection = await slavedb.getConnection();

        const [results] = await connection.query(
            `SELECT balance FROM users WHERE id = ?`,
            [userId]
        );

        return results.length > 0 ? results[0].balance : null;
    } catch (err) {
        console.error(`❌ Error getting balance:`, err);
        return null;
    } finally {
        if (connection) connection.release();
    }
}


export async function getUserInfo(userId) {
    let connection;
    try {
        connection = await slavedb.getConnection();

        const [results] = await connection.query(
            `SELECT id, username FROM users WHERE id = ?`,
            [userId]
        );

        return results.length > 0 ? results[0] : null;
    } catch (err) {
        console.error(`❌ Error getting user info:`, err);
        return null;
    } finally {
        if (connection) connection.release();
    }
}
