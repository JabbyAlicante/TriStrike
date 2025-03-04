import mysql from "mysql2";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }
    console.log("✅ Connected to database.");
});

// Export database connection & SECRET_KEY
export const SECRET_KEY = process.env.SECRET_KEY;
export default db;
