import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const saltRounds = 10;
const JWT_SECRET =  process.env.JWT_SECRET || "12345";

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "2hrs" }
    );
};

//Sign up
export const signupUser = (username, email, password, callback) => {
    const checkUserQuery = "SELECT id FROM users WHERE username = ? OR email = ?";
    const insertUserQuery = "INSERT INTO users (username, email, pass_hash, balance) VALUES (?, ?, ?, 100)";

    db.query(checkUserQuery, [username, email], (err, results) => {
        if (err) return callback(err, null);

        if (results.length > 0) {
            return callback(null, { success: false, message: "Username or email already exists" });
        }

        // Hash pass
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) return callback(err, null);

            db.query(insertUserQuery, [username, email, hashedPassword], (err, result) => {
                if (err) return callback(err, null);
                return callback(null, { success: true, message: "User registered successfully!" });
            });
        });
    });
};

// 🔹 Login
export const loginUser = (username, password, callback) => {
    const query = "SELECT id, username, email, pass_hash, balance FROM users WHERE username = ?";

    db.query(query, [username], (err, results) => {
        if (err) return callback(err, null);

        if (results.length === 0) {
            return callback(null, { success: false, message: "Invalid username or password" });
        }

        const user = results[0];

        bcrypt.compare(password, user.pass_hash, (err, isMatch) => {
            if (err) return callback(err, null);

            if (isMatch) {
                delete user.pass_hash;
                const token = generateToken(user);
                return callback(null, { success: true, user, token });
            } else {
                return callback(null, { success: false, message: "Invalid username or password" });
            }
        });
    });
};

export const verifyToken = (token, callback) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                console.error("❌ Token expired.");
                return callback(null, "expired");
            }
            console.error("❌ Token verification failed:", err.message);
            return callback(null);
        }
        console.log("✅ Token verified successfully:", decoded);
        return callback(decoded);
    });
};

