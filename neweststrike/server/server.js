import fs from 'node:fs';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import { signupUser, loginUser, verifyToken } from './services/userService.js';
import { startGameService, getGameState } from './services/gameService.js';
import { getUserBalance, deductBalance, addPrizeToWinner } from './services/balanceService.js';
import { placeBet } from './services/betsService.js';
import { distributePrizePool } from './services/prizeService.js';
import { strikeStore } from './services/store.js';

dotenv.config();

const IS_PRODUCTION = process.env.ENV === 'production';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HOST_PORT = 3000;
const PORT = process.env.PORT || 3000;
const isHost = PORT == HOST_PORT;

async function createCustomServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  let vite;
  let masterSocket = null;

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

  server.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);

    if (isHost) {
      try {
        startGameService(io);
        console.log('✅ Master game service started successfully.');
      } catch (err) {
        console.error('❌ Error starting game service:', err);
      }
    } else {
      // If it's a slave, connect to the master
      masterSocket = Client(`http://localhost:${HOST_PORT}`, {
        transports: ['websocket', 'polling'],
      });

      masterSocket.on('connect', () => {
        console.log('✅ Connected to master server');
      });

      masterSocket.on('disconnect', () => {
        console.log('❌ Disconnected from master server');
      });
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    socket.emit('welcome', 'A message from the server');

    // ---------------------- SIGN-UP ----------------------
    socket.on('sign-up', async (data) => {
      if (!isHost) {
        console.log('🔀 Forwarding sign-up request to master');
        masterSocket.emit('sign-up', data);

        masterSocket.once('signup-response', (response) => {
          socket.emit('signup-response', response);
        });
        return;
      }

      const { username, email, password } = data;
      await signupUser(socket, username, email, password);
    });

    // ---------------------- LOG-IN ----------------------
    socket.on('log-in', async (data) => {
      if (!isHost) {
        console.log('🔀 Forwarding log-in request to master');
        masterSocket.emit('log-in', data);

        // Listen for response from master
        masterSocket.once('login-response', (response) => {
          socket.emit('login-response', response);
        });
        return;
      }

      const { username, password } = data;
      await loginUser(socket, username, password);
    });

    // ---------------------- PLACE BET ----------------------
    socket.on('place-bet', async (data) => {
      if (!isHost) {
        console.log('🔀 Forwarding place-bet request to master');
        masterSocket.emit('place-bet', data);

        // Listen for response from master
        masterSocket.once('bet-result', (response) => {
          socket.emit('bet-result', response);
        });
        return;
      }

      const { token, gameId, chosenNumbers, betAmount } = data;

      if (!token) {
        socket.emit('bet-result', { success: false, message: 'Token is missing.' });
        return;
      }

      const { success, user } = await verifyToken(token);
      if (!success) {
        socket.emit('bet-result', { success: false, message: 'Invalid token.' });
        return;
      }

      await placeBet(socket, gameId, chosenNumbers, betAmount, user);
    });

    // ---------------------- END GAME ----------------------
    socket.on('game_end', async (gameId) => {
      if (!isHost) {
        console.log('🔀 Forwarding game_end request to master');
        masterSocket.emit('game_end', gameId);

        // Listen for response from master
        masterSocket.once('game_ended', (response) => {
          socket.emit('game_ended', response);
        });
        return;
      }

      await distributePrizePool(gameId);
    });

    // ---------------------- BUY COINS ----------------------
    socket.on('buy_coins', async (data) => {
      if (!isHost) {
        console.log('🔀 Forwarding buy_coins request to master');
        masterSocket.emit('buy_coins', data);

        // Listen for response from master
        masterSocket.once('strike_store_response', (response) => {
          socket.emit('strike_store_response', response);
        });
        return;
      }

      const { token, amount } = data;
      await strikeStore(socket, token, amount);
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });

    // ---------------------- STATE UPDATE ----------------------
    if (!isHost) {
      masterSocket.on('state_update', (state) => {
        console.log('🔄 State update received from master:', state);
        io.emit('state_update', state);
      });
    }
  });
}

createCustomServer();
