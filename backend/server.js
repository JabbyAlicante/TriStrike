import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { startGameService, getGameState } from "./services/gameService.js";
import { signupUser, loginUser, verifyToken } from "./services/userService.js";
import { placeBet, checkGameResults } from "./services/betsService.js";
import { getUserBalance } from "./services/balanceService.js";
import { getTotalPrizePool, updatePrizePool } from "./services/prizeService.js";

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
    console.log("✅ A user connected:", socket.id);

    // SIGNUP
    socket.on("signup", ({ username, email, password }) => {
        console.log("🔹 Signup attempt:", username, email);
        if (!username || !email || !password) {
            return socket.emit("signup_response", { success: false, message: "All fields are required" });
        }

        signupUser(username, email, password, (err, response) => {
            if (err) {
                console.error("❌ Signup error:", err.message);
                socket.emit("signup_response", { success: false, message: "Database error" });
            } else {
                console.log("✅ Signup successful for:", username);
                socket.emit("signup_response", response);
            }
        });
    });

    // LOGIN
    socket.on("login", ({ username, password }) => {
        console.log("🔹 Login attempt:", username);
        if (!username || !password) {
            return socket.emit("login_response", { success: false, message: "Username and password required" });
        }

        loginUser(username, password, (err, response) => {
            if (err) {
                console.error("❌ Login error:", err.message);
                socket.emit("login_response", { success: false, message: "Database error" });
            } else if (response.success) {
                console.log("✅ Login successful for:", username);
                activeUsers.set(socket.id, response.user);
                socket.emit("login_response", response);

                getUserBalance(response.user.id, (err, balance) => {
                    if (!err) {
                        console.log("💰 User balance:", balance);
                        socket.emit("update_balance", { balance });
                    }
                });
            } else {
                socket.emit("login_response", response);
            }
        });
    });

    socket.on("authenticate", (token) => {
        if (!token || typeof token !== "string") {
            console.error("❌ Invalid token format received:", token);
            socket.emit("auth_response", { success: false, message: "Invalid token format. Please log in again." });
            return;
        }
        
        verifyToken(token, (decodedUser, error) => {
            if (error === "expired") {
                socket.emit("auth_response", { success: false, message: "Session expired. Please log in again." });
                return;
            }
    
            if (decodedUser) {
                socket.emit("auth_response", { success: true, user: decodedUser, message: "Authentication successful" });
            } else {
                socket.emit("auth_response", { success: false, message: "Invalid Token" });
            }
        });
    });
    

    // PLACE BET
    socket.on("place_bet", (data) => {
        const user = activeUsers.get(socket.id);
        if (!user) {
            return socket.emit("game_result", { success: false, message: "User not logged in" });
        }

        console.log(`🔹 ${user.username} is placing a bet on:`, data.numbers);

        getUserBalance(user.id, (err, balance) => {
            if (err || balance < 20) {
                return socket.emit("game_result", { success: false, message: "❌ Not enough coins to place bet" });
            }

            getGameState((currentGameState) => {
                if (!currentGameState || !currentGameState.gameId) {
                    return socket.emit("game_result", { success: false, message: "No active game round" });
                }

                placeBet(user.id, currentGameState.gameId, data.numbers, io, (err) => {
                    if (err) {
                        return socket.emit("game_result", { success: false, message: "Bet failed" });
                    }

                    console.log(`✅ Bet placed successfully by ${user.username}`);
                    updatePrizePool(currentGameState.gameId, 20, (updateErr) => {
                        if (updateErr) {
                            console.error("❌ Error updating prize pool:", updateErr);
                        } else {
                            console.log("🏆 Prize pool updated successfully!");
                        }
                    });

                    getTotalPrizePool(currentGameState.gameId, (totalPrize) => {
                        console.log("💰 Updated Prize Pool:", totalPrize);
                        io.emit("prize_pool_response", { success: true, totalPrize });
                        
                    });

                    getUserBalance(user.id, (err, newBalance) => {
                        if (!err) {
                            console.log("💰 Updated User Balance:", newBalance);
                            socket.emit("update_balance", { balance: newBalance });
                        }
                    });
                });
            });
        });
    });

    // GET RESULTS

    let lastCheckGameId = null;
    socket.on("get_results", () => {
        getGameState((currentGameState) => {
            if (!currentGameState || !currentGameState.gameId) {
                return socket.emit("game_result", { success: false, message: "No active game round" });
            }

            if (lastCheckGameId == currentGameState.gameId) {
                console.log("Done checking result for this game");
                return;
            }

            lastCheckGameId = currentGameState.gameId;

            console.log("🔍 Checking results for gameId:", currentGameState.gameId);
            checkGameResults(currentGameState.gameId, currentGameState.winningNumber, io, (winners) => {
                if (winners.length > 0) {
                    console.log("🏆 Winners found! Resetting prize pool...");
                    updatePrizePool(currentGameState.gameId, 0, (updateErr) => {
                        if (updateErr) {
                            console.error("❌ Error resetting prize pool:", updateErr);
                        }
                    });
                }
            });
        });
    });

    socket.on("logout", () => {
        activeUsers.delete(socket.id);
        socket.emit("logout_response", { success: true, message: "logged out success"});
        socket.disconnect(true);
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
