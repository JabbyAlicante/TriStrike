import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Server } from 'socket.io';
import dotenv from "dotenv";
import { signupUser, loginUser, verifyToken } from "./services/userService.js";
import { startGameService, getGameState } from './services/gameService.js';
import { getUserBalance, deductBalance, addPrizeToWinner } from "./services/balanceService.js";
import { placeBet } from './services/betsService.js';
import { distributePrizePool } from './services/prizeService.js';
import { strikeStore } from "./services/store.js";


dotenv.config();

const IS_PRODUCTION = process.env.ENV === 'production';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createCustomServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });

  let vite;

  if (IS_PRODUCTION) {
    app.use(express.static(path.resolve(__dirname, './dist/client/')));
  } else {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);
  }

  app.use('*', async (req, res, next) => {
    try {
      const indexPath = path.resolve(
        __dirname,
        IS_PRODUCTION ? '../dist/index.html' : '../src/index.html'
      );
      res.sendFile(indexPath);
    } catch (e) {
      next(e);
    }
  });

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);

    try {
      // await initializeGameState(io);

      startGameService(io);

      console.log("✅ Game service started successfully.");
    } catch (err) {
      console.error("❌ Error starting game service:", err);
    }
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', err);
    }
  });

//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token;

//     if (!token) {
//         console.error("❌ No token provided");
//         return next(new Error("AUTH_FAILED"));
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         socket.user = { 
//             id: decoded.id, 
//             username: decoded.username,
//             balance: decoded.balance // ✅ Attach balance to socket.user
//         };
//         next();
//     } catch (err) {
//         console.error("❌ Invalid token:", err.message);
//         return next(new Error("AUTH_FAILED"));
//     }
// });



io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.emit('welcome', 'A message from the server');

  socket.on('sign-up', async (data) => {
      const { username, email, password } = data;
      await signupUser(socket, username, email, password);
  });

  socket.on('log-in', async (data) => {
      const { username, password } = data;
      await loginUser(socket, username, password);
  });

  socket.on('place-bet', async (data) => {
    const { token, gameId, chosenNumbers, betAmount } = data;

    if (!token) {
        socket.emit('bet_failed', { message: "Token is missing." });
        return;
    }

    const { success, user } = await verifyToken(token);
    if (!success) {
        socket.emit('bet_failed', { message: "Invalid or expired token." });
        return;
    }

    console.log(`🎲 User ${user.id} is placing a bet`);

    try {
        await placeBet(socket, gameId, chosenNumbers, betAmount, user); 
    } catch (error) {
        console.error(`❌ Error placing bet: ${error.message}`);
        socket.emit('bet_failed', { message: "Failed to place bet." });
    }
  });



  socket.on('game_end', async (gameId) => {
      console.log(`🛑 Ending game with ID: ${gameId}`);
  
      if (!gameId) {
          socket.emit('game_end_failed', {
              success: false,
              message: 'Game ID is required'
          });
          return;
      }
  
      try {
          await distributePrizePool(gameId);
  
          io.emit('game_ended', {
              success: true,
              message: `Game ${gameId} has ended and prizes have been distributed!`
          });
      } catch (err) {
          console.error(`❌ Error ending game ${gameId}:`, err);
          socket.emit('game_end_failed', {
              success: false,
              message: 'Failed to end game',
              error: err.message
          });
      }
  });

  socket.on("buy_coins", async (data) => {
      const { token, amount } = data;

      if (!token) {
          socket.emit("strike_store_response", {
              success: false,
              message: "Missing token",
              statusCode: 401,
              data: null,
          });
          return;
      }

      console.log(`💰 Buying coins request from ${socket.id}`);

      await strikeStore(socket, token, amount);
  });

  socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
}

createCustomServer();
