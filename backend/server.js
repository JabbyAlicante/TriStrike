import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { signupUser, loginUser, verifyToken } from "./services/userService.js";
import { getGameState, startGameService } from "./services/gameService.js";
import { getUserBalance } from "./services/balanceService.js";
import { distributePrizePool, getTotalPrizePool, storeCarryOverPrize } from "./services/prizeService.js";
import { placeBet } from "./services/betsService.js";
import { strikeStore } from "./services/store.js";
import db from "./config/db.js";
import { userHistory } from "./services/historyService.js";

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

function isAuthenticated(socket) {
    if (!socket.user || !socket.user.id) {
        console.log(`❌ Unauthorized access attempt from socket: ${socket.id}`);
        socket.emit("error", { message: "Unauthorized. Please log in." });
        return false;
    }
    console.log(`✅ User authenticated: ${socket.user.id}`);
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

                socket.user = response.user;
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
            socket.user = decodedUser.user; 
            socket.join("authenticated");
            socket.emit("auth_response", { success: true, user: decodedUser.user });
        });
    });
    

    socket.on("user_balance", () => { 
        console.log("💰 Checking user balance...");

        console.log("Debug - socket.user:", socket.user);
    
        if (!socket.user) {
            console.log("❌ Not authenticated");
            return socket.emit("error", { message: "User not authenticated" });
        }
    
        const userId = socket.user?.id;
    
        if (!userId) {
            console.log("❌ Error: Missing userId from socket data.");
            return socket.emit("error", { message: "User ID is required to fetch balance" });
        }
    
        console.log(`✅ Extracted userId from socket: ${userId}`);
    
        getUserBalance(userId, (err, balance) => {
            if (err) {
                console.log("❌ Error fetching balance:", err);
                return socket.emit("error", { message: "Failed to fetch balance" });
            }
    
            console.log(`💰 User ${userId} balance: ${balance}`);
            socket.emit("user_balance", { success: true, balance });
        });
    });
    
    
    

    // PLACE BET
    socket.on("place_bet", ({ gameId, chosenNumbers, betAmount }) => {
        console.log(`🎲 Bet placed - User: ${socket.user?.user?.id}, Game: ${gameId}, Amount: ${betAmount}`);

        if (!isAuthenticated(socket)) return;

        const userId = socket.user?.id;


        placeBet(userId, gameId, chosenNumbers, (err, result) => {
            if (err) {
                console.error("❌ Error placing bet:", err);
                return socket.emit("bet_response", { success: false, message: "Failed to place bet" });
            }
            console.log(`✅ Bet placed successfully for user ${userId}`);
            socket.emit("bet_response", { success: true, message: "Bet placed successfully", result });
        });
    });

    socket.on("prize_pool", (data) => {
        if (!isAuthenticated(socket)) return;
        console.log("🔍 Received prize_pool event with data:", data);
    
        const { gameId } = data;
    
        if (!gameId) {
            console.error("❌ Missing gameId in prize_pool event!");
            return socket.emit("prize_pool_response", { success: false, message: "Invalid game ID" });
        }
    
        console.log(`🏆 Fetching prize pool for game ${gameId}`);
    
        getTotalPrizePool(gameId, (err, prizes) => {
            if (err) {
                console.error("❌ Error retrieving prize pool:", err);
                return socket.emit("prize_pool_response", { success: false, message: "Error retrieving prize pool" });
            }
    
            console.log(`🏆 Prize pool for game ${gameId}: ${prizes}`);
            socket.emit("prize_pool_response", { success: true, prizePool: prizes });
    
            // START DISTRIBUTION AFTER FETCHING PRIZE POOL
            distributePrizePool(gameId, (err, message) => {
                if (err) {
                    console.error("❌ Error distributing prize pool:", err);
                    return socket.emit("prize_distribution_response", { success: false, message: "Error distributing prize pool" });
                }
    
                console.log(`✅ ${message}`);
    
                // AFTER DISTRIBUTION, FETCH UPDATED PRIZE POOL
                getTotalPrizePool(gameId, (err, updatedPrizePool) => {
                    if (err) {
                        console.error("❌ Error fetching updated prize pool:", err);
                        return;
                    }
    
                    console.log(`🔄 Updated prize pool for next game: ${updatedPrizePool}`);
    
                    // SEND UPDATED PRIZE POOL TO THE SAME CLIENT
                    socket.emit("prize_pool_response", { success: true, prizePool: updatedPrizePool });
                });
            });
        });
    });
    

    // GAME ENDED
    socket.on("game_ended", ({ gameId }) => {
        console.log(`🏆 Game ${gameId} ended, distributing prizes...`);

        distributePrizePool(gameId, (err, result) => {
            if (err) {
                console.log("❌ Error distributing prizes:", err);
                return socket.emit("prize_distribution", { success: false, message: "Error distributing prizes" });
            }

            console.log(`✅ ${result?.message || "Prizes distributed successfully."}`);

            if (result?.winners?.length > 0) {
                result.winners.forEach(({ userId, amount }) => {
                    console.log(`🎉 Prize awarded: User ${userId} received ${amount} coins`);
                });
            } else {
                console.log("🔄 No winners, carrying over prize to next round.");
                getTotalPrizePool(gameId, (err, totalPrizePool) => {
                    if (!err && totalPrizePool > 0) {
                        storeCarryOverPrize(totalPrizePool, (err, result) => {
                            if (err) console.error("❌ Failed to carry over prize:", err);
                            else console.log(`✅ ${result}`);
                        });
                    }
                });
            }

            // ✅ Broadcast to all clients
            io.emit("prize_distribution", {
                success: true,
                message: result?.message || "Prize distribution completed.",
                winners: result?.winners || []
            });
        });
    });

    // GET GAME STATE
    socket.on("game_state", () => {
        console.log("🎮 Fetching game state...");
        if (!isAuthenticated(socket)) return;

        getGameState((state) => {
            if (!state) {
                console.error("❌ Failed to fetch game state");
                return socket.emit("game_update", { success: false, message: "Failed to fetch game state" });
            }

            console.log("🎮 Game state updated:", state);
            io.emit("game_update", state);
        });
    });

    // GET LATEST GAME
    socket.on("get_latest_game", () => {
        db.query(
            "SELECT id FROM games WHERE status = 'ongoing' ORDER BY created_at DESC LIMIT 1",
            (err, results) => {
                if (err || results.length === 0) {
                    console.log("❌ No active game found.");
                    socket.emit("latest_game_response", { success: false });
                    return;
                }
                console.log(`📌 Latest active game ID: ${results[0].id}`);
                socket.emit("latest_game_response", { success: true, gameId: results[0].id });
            }
        );
    });

    socket.on("buy_coins", ({ amount }) => {
        console.log(`User ${socket.user?.user?.id} buying ${amount} coins...`);
         if (!isAuthenticated(socket)) return;

        //  console.log("Debug - socket.user:", socket.user.user.id);
         const userId = socket.user?.id;

         strikeStore(userId, amount, (err,result) => {
            if (err) {
                console.error("Error buying coins", err);
                return socket.emit("buy_coins_response", { success: false, message: "failed to buy coins"});
            }

            console.log(`User ${userId} successfully bought ${amount} coins`);

            getUserBalance(userId, (err, balance) => {
                if (err) {
                    console.error("error fetching bal", err);
                    return;
                }

                socket.emit("buy_coins_response", { success: true, balance, message: `${amount} coins added to to your balance`});
            });
         });
    });

    socket.on("get_last_bet", (data) => {
        console.log(`📌 Tracking last bet for user: ${data.userId}`);
        if (!data.userId) {
            console.error("❌ Missing user ID");
            return;
        }
    
        userHistory(data.userId, (err, result) => {
            if (err) {
                console.error("❌ Error tracking last bet:", err);
                socket.emit("last_bet_response", { success: false, message: "Failed to fetch last bet." });
            } else {
                console.log("📊 Last bet result:", result);
                socket.emit("last_bet_response", result);
            }
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
