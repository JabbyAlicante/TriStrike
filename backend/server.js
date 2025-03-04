import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { signupUser, loginUser, verifyToken } from "./services/userService.js";
import { getGameState, startGameService } from "./services/gameService.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const activeUsers = new Map();

startGameService(io);

io.on("connection", (socket) => {
    console.log(`✅ New connection: ${socket.id}`);

    // SIGNUP
    socket.on("signup", ({ username, email, password }) => {
        console.log(`📌 Signup attempt - Username: ${username}, Email: ${email}`);
        
        if (!username || !email || !password) {
            console.log("⚠ Signup failed: Missing fields");
            return socket.emit("signup_response", { success: false, message: "All fields are required" });
        }

        signupUser(username, email, password, (err, response) => {
            if (err) {
                console.log("❌ Signup error: Database issue");
                socket.emit("signup_response", { success: false, message: "Database error" });
            } else {
                console.log(`✅ Signup successful for: ${username}`);
                socket.emit("signup_response", response);
            }
        });
    });

    // LOGIN
    socket.on("login", ({ username, password }) => {
        console.log(`🔑 Login attempt - Username: ${username}`);
        
        if (!username || !password) {
            console.log("⚠ Login failed: Missing credentials");
            return socket.emit("login_response", { success: false, message: "Username and password required" });
        }

        loginUser(username, password, (err, response) => {
            if (err) {
                console.log("❌ Login error: Database issue");
                socket.emit("login_response", { success: false, message: "Database error" });
            } else if (response.success) {
                console.log(`✅ Login successful for: ${username}`);
                activeUsers.set(socket.id, response.user);
                socket.emit("login_response", response);
            } else {
                console.log("❌ Login failed: Incorrect credentials");
                socket.emit("login_response", response);
            }
        });
    });

    // AUTHENTICATE
    socket.on("authenticate", (token) => {
        console.log(`🔍 Authenticating user...`);
        
        if (!token || typeof token !== "string") {
            console.log("⚠ Authentication failed: No token provided");
            return socket.emit("auth_response", { success: false, message: "Invalid token. Please log in again." });
        }

        verifyToken(token, (decodedUser, error) => {
            if (error === "expired") {
                console.log("⚠ Authentication failed: Token expired");
                socket.emit("auth_response", { success: false, message: "Session expired. Please log in again." });
                return;
            }

            if (decodedUser) {
                console.log(`✅ Authentication successful`);
                socket.join("authenticated");
                socket.emit("auth_response", { success: true, user: decodedUser });
            } else {
                console.log("❌ Authentication failed: Invalid token");
                socket.emit("auth_response", { success: false, message: "Invalid Token" });
            }
        });
    });

    socket.on("game_state", () =>{
        if (!socket.rooms.has("authenticated")) {
            console.log("unauthorized to game state");
            socket.emit("game_update", { error:"Unauthorized"});
            return;
        }

        getGameState((state) => {
            socket.emit("game_update", state);
        });
    });

    // LOGOUT
    socket.on("logout", () => {
        console.log(`🔴 User logged out: ${socket.id}`);
        activeUsers.delete(socket.id);
        socket.emit("logout_response", { success: true, message: "Logged out successfully" });
        socket.disconnect(true);
    });

    socket.on("disconnect", () => {
        console.log(`🔴 User disconnected: ${socket.id}`);
        activeUsers.delete(socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
