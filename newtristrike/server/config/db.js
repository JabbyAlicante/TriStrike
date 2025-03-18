import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let db;

const connectDB = async () => {
    try {
        db =await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log("Connected to db!");
    } catch (err) {
        console.error("error db: ", err);
        throw err;
    }
};

await connectDB();

export const SECRET_KEY = process.env.SECRET_KEY;
export default db;

