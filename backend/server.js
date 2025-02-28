import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { startGameService, getGameState } from "./services/gameService.js";
import { signupUser, loginUser } from "./services/userService.js";

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
    console.log("✅ A user connected yeyyy:", socket.id);

    //SIGN IN
    socket.on("signup", ({ username, email, password }) => {
        if (!username || !email || !password) {
            return socket.emit("signup_response", { success: false, message: "All fields are required" });
        }

        signupUser(username, email, password, (err, response) => {
            if (err) {
                console.error("Signup error:", err.message);
                socket.emit("signup_response", { success: false, message: "Database error" });
            } else {
                socket.emit("signup_response", response);
            }
        });
    });

    //LOG IN
    socket.on("login", ({ username, password }) => {
        if (!username || !password) {
            return socket.emit("login_response", { success: false, message: "Username and password required" });
        }

        loginUser(username, password, (err, response) => {
            if (err) {
                console.error("Login error oh no :o :", err.message);
                socket.emit("login_response", { success: false, message: "Database error" });
            } else if (response.success) {
                activeUsers.set(socket.id, response.user); 
                socket.emit("login_response", response);
                socket.emit("game_update", getGameState()); 
            } else {
                socket.emit("login_response", response);
            }
        });
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
        activeUsers.delete(socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
