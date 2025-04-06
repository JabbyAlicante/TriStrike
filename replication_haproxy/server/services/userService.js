import {slavedb, masterdb} from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { promisify } from "node:util";

dotenv.config();

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("❌ Missing JWT_SECRET in environment variables!");
}

const generateToken = (user) => {
    console.log("🛠️ Generating token for user:", user);
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username,
            balance: user.balance 
        },
        JWT_SECRET,
        { expiresIn: "1d" }
    );
};

const verifyTokenAsync = promisify(jwt.verify);

export const signupUser = async (socket, username, email, password) => {
    console.log(`📩 Signup request received - Username: ${username}, Email: ${email}`);

    try {
        const [existingUsers] = await masterdb.query(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [username, email]
        );
        console.log("🔎 Checking for existing users:", existingUsers);

        if (existingUsers.length > 0) {
            console.log("⚠️ Username or email already exists");
            socket.emit('signup-response', { 
                success: false, 
                message: "Username or email already exists" 
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log("📝 Inserting new user into database...");
        const [results] = await masterdb.query(
            "INSERT INTO users (username, email, pass_hash, balance) VALUES (?, ?, ?, 100)",
            [username, email, hashedPassword]
        );
        console.log("✅ User inserted:", results);

        const userId = results.insertId;
        console.log("🔎 Fetching newly created user...");
        const [user] = await slavedb.query(
            "SELECT id, username, balance, created_at, last_login FROM users WHERE id = ?",
            [userId]
        );
        console.log("✅ User fetched:", user[0]);

        console.log("🚀 Signup successful!");
        socket.emit('signup-response', { 
            success: true, 
            user: user[0],
            message: "User registered successfully!" 
        });

    } catch (err) {
        console.error("❌ Error during signup:", err);
        socket.emit('signup-response', { 
            success: false, 
            message: "Error during signup" 
        });
    }
};

export const loginUser = async (socket, username, password) => {
    console.log(`📩 Login request received - Username: ${username}`);

    try {
        console.log("🔎 Checking user in database...");
        const [results] = await slavedb.query(
            "SELECT id, username, pass_hash, balance, created_at FROM users WHERE username = ?",
            [username]
        );
        console.log("✅ User found in database:", results);

        if (results.length === 0) {
            console.log("⚠️ Invalid username or password");
            socket.emit('login-response', { 
                success: false, 
                message: "Invalid username or password", 
                statusCode: 401 
            });
            return;
        }
        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.pass_hash);

        if (!isMatch) {
            console.log("❌ Incorrect password");
            socket.emit('login-response', { 
                success: false, 
                message: "Invalid username or password", 
                statusCode: 401 
            });
            return;
        }
        delete user.pass_hash;

        console.log("Generating token...");
        const token = generateToken({
            id: user.id,
            username: user.username,
            balance: user.balance
            });
        console.log(" Token generated:", token);

        console.log("🚀 Login successful!");
        socket.emit('login-response', { 
            success: true, 
            user: {
                id: user.id,
                username: user.username,
                balance: user.balance,
                createdAt: user.created_at
            },
            token,
            message: "Login successful!",
            statusCode: 200
        });

    } catch (err) {
        console.error(" Error during login:", err);
        socket.emit('login-response', { 
            success: false, 
            message: "Error during login" 
        });
    }
};

export const verifyToken = async (token) => {
    try {
        const decoded = await verifyTokenAsync(token, JWT_SECRET);
        console.log(" Token verified successfully:", decoded);
        return { success: true, user: decoded };
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            console.error("Token expired.");
            throw new Error("Token expired");
        }
        console.error("Token verification failed:", err.message);
        throw new Error("Invalid token");
    }
};
