import db from "../config/db.js"; 

// 🔹 sign up
export const signupUser = (username, email, password, callback) => {
    const checkUserQuery = "SELECT id FROM users WHERE username = ? OR email = ?";
    const insertUserQuery = "INSERT INTO users (username, email, pass_hash, balance) VALUES (?, ?, ?, 100)";

    db.query(checkUserQuery, [username, email], (err, results) => {
        if (err) return callback(err, null);

        if (results.length > 0) {
            return callback(null, { success: false, message: "Username or email already exists" });
        }

        db.query(insertUserQuery, [username, email, password], (err, result) => {
            if (err) return callback(err, null);
            return callback(null, { success: true, message: "User registered successfully!" });
        });
    });
};

// 🔹 login
export const loginUser = (username, password, callback) => {
    const query = "SELECT id, username, email, balance FROM users WHERE username = ? AND pass_hash = ?";

    db.query(query, [username, password], (err, results) => {
        if (err) return callback(err, null);

        if (results.length > 0) {
            return callback(null, { success: true, user: results[0] }); 
        } else {
            return callback(null, { success: false, message: "Invalid username or password" });
        }
    });
};
