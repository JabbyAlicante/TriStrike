import { getBalance, getUserInfo } from "./balanceService.js";
import { verifyToken } from "./userService.js";
import db from "../config/db.js";

export async function strikeStore(socket, token, amount) {
    if (!token || !amount) {
        socket.emit("strike_store_response", {
            success: false,
            message: "Token and amount are required",
            data: null
        });
        return;
    }

    try {
        const { success, user } = await verifyToken(token);
        if (!success) {
            socket.emit("strike_store_response", {
                success: false,
                message: "Invalid or expired token",
                statusCode: 401, 
                data: null
            });
            return;
        }

        const userId = user.id;

        const [result] = await db.query(
            "UPDATE users SET balance = balance + ? WHERE id = ?",
            [amount, userId]
        );

        if (result.affectedRows === 0) {
            socket.emit("strike_store_response", {
                success: false,
                message: "User not found or balance update failed",
                statusCode: 404, 
                data: null
            });
            return;
        }

        const newBalance = await getBalance(userId);
        const userInfo = await getUserInfo(userId);

        console.log(`✅ Balance updated for User ${userId}: New Balance = ${newBalance}`);

        socket.emit("strike_store_response", {
            success: true,
            message: `Balance updated successfully!`,
            statusCode: 200, 
            data: {
                userId,
                username: userInfo.username,
                newBalance
            }
        });
    } catch (err) {
        console.error("❌ Error updating balance:", err);

        socket.emit("strike_store_response", {
            success: false,
            message: "Error updating balance",
            statusCode: 500, 
            error: err.message
        });
    }
}
