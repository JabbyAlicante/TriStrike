import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
});

// console.log("✅ Database pool created!");

(async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ Database connection successful!");
        connection.release();
    } catch (err) {
        console.error("❌ Database connection failed:", err);
    }
})();

export const SECRET_KEY = process.env.SECRET_KEY;
export default db;
