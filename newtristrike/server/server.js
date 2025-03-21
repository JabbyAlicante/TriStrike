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
import { getUserBalance } from './services/balanceService.js';
import { placeBet } from './services/betsService.js';
import { distributePrizePool } from './services/prizeService.js';

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

    socket.on('verify-token', async (token) => {
      try {
        const result = await verifyToken(token);
        socket.emit('token-verification', result);
      } catch (err) {
        socket.emit('token-verification', { success: false, message: err.message });
      }
    });

    socket.on('get-balance', async (data) => {
      const { token } = data;
      await getUserBalance(socket, token);
  });
  

  socket.on('get-game-state', () => {
    const state = getGameState();
    console.log("📡 Sending game state:", state);

    if (state) {
        socket.emit('game_update', {
            timer: state.timer,
            winningNumber: state.winningNumber,
            prizePool: state.prizePool
        });
    } else {
        socket.emit('game_update', {
            error: 'Game state not available'
        });
    }
});


  socket.on('place-bet', async (data) => {
    const userId = socket.user?.id;
    const { gameId, chosenNumbers, betAmount } = data;

    console.log(`🎲 User ${userId} is placing a bet of ${betAmount} on Game ${gameId}`);

    if (!userId) {
        console.error("❌ Error: User is not authenticated.");
        socket.emit('bet_failed', { message: "User is not authenticated." });
        return;
    }

    try {
        const result = await placeBet(userId, gameId, chosenNumbers, betAmount);
        if (result.success) {
            socket.emit('bet_success', result);
        } else {
            socket.emit('bet_failed', result);
        }
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
  

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
}

createCustomServer();
