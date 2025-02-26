import db from "../config/db.js";
import bcrypt from "bcrypt";

export async function registerUser({ username, password }) {
    console.log("Attempting to register:", username);
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (username, pass_hash, balance) VALUES (?, ?, 100)", [username, hashedPassword]);
        return { success: true, message: "Registration successful!", balance: 100 };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Error registering user" };
    }
}

export async function loginUser({ username, password }) {
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) return { success: false, message: "Invalid credentials" };

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.pass_hash);
        if (!isMatch) return { success: false, message: "Invalid credentials" };

        return { success: true, message: "Login successful!", balance: user.balance, user };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Server error" };
    }
}