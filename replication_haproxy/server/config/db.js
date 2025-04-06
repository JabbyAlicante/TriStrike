import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// const db = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10, 
//     queueLimit: 0
// });

const masterdb = mysql.createPool({
    host: process.env.DB_MASTER_HOST,
    user: process.env.DB_MASTER_USER,
    password: process.env.DB_MASTER_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
});

const slavedb = mysql.createPool({
    host: process.env.DB_SLAVE_HOST,
    user: process.env.DB_SLAVE_USER,
    password: process.env.DB_SLAVE_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
});

// (async () => {
//     try {
//         const connection = await masterdb.getConnection();
//         console.log("Database connection successful!");
//         connection.release();
//     } catch (err) {
//         console.error("Database connection failed:", err);
//     }
// })();

export const SECRET_KEY = process.env.SECRET_KEY;
export {slavedb, masterdb} ;
