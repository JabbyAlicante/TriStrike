import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { signupUser, loginUser, verifyToken } from "./services/userService.js";
import { getGameState, startGameService } from "./services/gameService.js";
import { getUserBalance, deductBalance } from "./services/balanceService.js";
import { distributePrizePool, getTotalPrizePool } from "./services/prizeService.js";
import db from "./config/db.js";

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

// Middleware to check authentication for each request
function isAuthenticated(socket) {
    if (!socket.user || !socket.user.user) {
        console.log(`❌ Unauthorized access attempt from socket: ${socket.id}`);
        socket.emit("error", { message: "Unauthorized. Please log in." });
        return false;
    }
    console.log(`✅ User authenticated: ${socket.user.user.id}`);
    return true;
}

io.on("connection", (socket) => {
    console.log(`✅ New connection: ${socket.id}`);

    // SIGNUP
    socket.on("signup", ({ username, email, password }) => {
        console.log(`📌 Signup attempt - Username: ${username}, Email: ${email}`);
        
        signupUser(username, email, password, (err, response) => {
            if (err) {
                console.log("❌ Signup error: Database issue");
                return socket.emit("signup_response", { success: false, message: "Database error" });
            }
            console.log(`✅ Signup successful for: ${username}`);
            socket.emit("signup_response", response);
        });
    });

    // LOGIN
    socket.on("login", ({ username, password }) => {
        console.log(`🔑 Login attempt - Username: ${username}`);
        
        loginUser(username, password, (err, response) => {
            if (err) {
                console.log("❌ Login error: Database issue");
                return socket.emit("login_response", { success: false, message: "Database error" });
            }

            if (response.success) {
                console.log(`✅ Login successful for: ${username}`);
                activeUsers.set(socket.id, response.user);
            } else {
                console.log("❌ Login failed: Incorrect credentials");
            }

            socket.emit("login_response", response);
        });
    });

    // AUTHENTICATE USER
    socket.on("authenticate", (token) => {
        console.log("🔍 Authenticating user...");
        
        verifyToken(token, (decodedUser, error) => {
            if (error) {
                console.log("❌ Authentication failed: Invalid or expired token");
                return socket.emit("auth_response", { success: false, message: "Invalid or expired token" });
            }

            console.log(`✅ Authentication successful for user ID: ${decodedUser.user.id}`);
            socket.user = decodedUser;
            socket.join("authenticated");
            socket.emit("auth_response", { success: true, user: decodedUser });
        });
    });

    // GET USER BALANCE
    socket.on("user_balance", () => {
        console.log("💰 Checking user balance...");
        if (!isAuthenticated(socket)) return;

        const userId = socket.user.user.id;
        getUserBalance(userId, (err, balance) => {
            if (err) {
                console.log("❌ Error fetching balance:", err);
                return socket.emit("error", { message: "Failed to fetch balance" });
            }
            console.log(`💰 User ${userId} balance: ${balance}`);
            socket.emit("user_balance", { balance });
        });
    });

    // PLACE A BET
    socket.on("place_bet", ({ gameId, chosenNumbers, betAmount }) => {
        console.log(`🎲 Bet placed - User: ${socket.user?.user?.id}, Game: ${gameId}, Amount: ${betAmount}`);
    
        if (!isAuthenticated(socket)) return;
    
        const userId = socket.user.user.id;
    
        deductBalance(userId, betAmount, (err, newBalance) => {
            if (err) {
                console.log("❌ Bet failed: Insufficient balance");
                return socket.emit("bet_response", { success: false, message: "Insufficient balance" });
            }
    
            //  Place the bet 
            db.query(`SELECT status FROM games WHERE id = ?`, [gameId], (err, results) => {
                if (err || results.length === 0 || results[0].status !== "ongoing") {
                    console.log(`❌ Bet failed: Invalid or finished game ${gameId}`);
                    return socket.emit("bet_failed", { message: "Invalid or finished game!" }); 
                }
    
                db.query(
                    `INSERT INTO bets (user_id, game_id, chosen_nums, amount) VALUES (?, ?, ?, ?)`, 
                    [userId, gameId, JSON.stringify(chosenNumbers), betAmount], 
                    (err) => {
                        if (err) {
                            console.error("❌ Error placing bet:", err);
                            return socket.emit("bet_response", { success: false, message: "Bet failed" });
                        }
    
                        console.log(`✅ Bet successful for User ${userId}. New balance: ${newBalance}`);
                        socket.emit("bet_response", { success: true, message: "Bet placed!", newBalance });
    
                        // Fetch and broadcast the updated prize pool
                        getTotalPrizePool(gameId, (err, prizePool) => {
                            if (!err) {
                                console.log(`📢 Updated Prize Pool: ${prizePool}`);
                                io.emit("update_prize_pool", { gameId, prizePool });
                            }
                        });
                    }
                );
            });
        });
    });
        

    // CHECK PRIZE POOL
    socket.on("prize_pool", (data) => {
        console.log("🔍 Received prize_pool event with data:", data);
    
        const { gameId } = data;
    
        if (!gameId) {
            console.error("❌ Missing gameId in prize_pool event!");
            return socket.emit("prize_pool_response", { success: false, message: "Invalid game ID" });
        }
    
        console.log(`🏆 Fetching prize pool for game ${gameId}`);
        if (!isAuthenticated(socket)) return;
    
        getTotalPrizePool(gameId, (err, prizePool) => {
            if (err) {
                console.log("❌ Error retrieving prize pool:", err);
                return socket.emit("prize_pool_response", { success: false, message: "Error retrieving prize pool" });
            }
    
            console.log(`🏆 Prize pool for game ${gameId}: ${prizePool}`);
            socket.emit("prize_pool_response", { success: true, prizePool });
        });
    });
    

    socket.on("game_ended", ({ gameId }) => {
        console.log(`🏆 Game ${gameId} ended, distributing prizes...`);
        
        distributePrizePool(gameId, (err, message) => {
            if (err) {
                console.log("❌ Error distributing prizes:", err);
                return socket.emit("prize_distribution", { success: false, message: "Error distributing prizes" });
            }
    
            console.log(`✅ Prize distribution completed: ${message}`);
            socket.emit("prize_distribution", { success: true, message });
    
            if (message === "No winners. Prize carried over.") {
                console.log("🔄 No winners, carrying over prize to next round.");
                getTotalPrizePool(gameId, (err, totalPrizePool) => {
                    if (!err && totalPrizePool > 0) {
                        storeCarryOverPrize(totalPrizePool);
                    }
                });
            }
        });
    });
        

    // GET GAME STATE
    socket.on("game_state", () => {
        console.log("🎮 Fetching game state...");
        if (!isAuthenticated(socket)) return;
    
        getGameState((state) => {
            console.log("🎮 Game state updated:", state);

            io.emit("game_update", state);
        });
    });

    socket.on("get_latest_game", () => {
        db.query("SELECT id FROM games WHERE status = 'ongoing' ORDER BY created_at DESC LIMIT 1", (err, results) => {
            if (err || results.length === 0) {
                console.log("❌ No active game found.");
                socket.emit("latest_game_response", { success: false });
                return;
            }
            console.log(`📌 Latest active game ID: ${results[0].id}`);
            socket.emit("latest_game_response", { success: true, gameId: results[0].id });
        });
    });
    
    
    
    

    // LOGOUT
    socket.on("logout", () => {
        console.log(`🔴 User logged out: ${socket.id}`);
        activeUsers.delete(socket.id);
        socket.emit("logout_response", { success: true, message: "Logged out successfully" });
        socket.disconnect(true);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
        console.log(`🔴 User disconnected: ${socket.id}`);

        if (activeUsers.has(socket.id)) {
            console.log(`🗑 Removed user: ${socket.id} from active users`);
            activeUsers.delete(socket.id);
        }
    });
    
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
