import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Server } from 'socket.io';
import dotenv from "dotenv";
import { signupUser, loginUser, verifyToken } from "./services/userService.js";
import { initializeGameState, startGameService, getGameState } from './services/gameService.js';
import { getUserBalance } from './services/balanceService.js';


dotenv.config();

const IS_PRODUCTION = process.env.ENV === 'production';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createCustomServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server);

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

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});


  // Initialize game state and start game loop
  await initializeGameState(); 
  startGameService(io);

  io.on('connection', (socket) => {
    console.log('User connected');

    socket.emit('welcome', 'A message from the server');

    // Sign-up event
    socket.on('sign-up', async (data) => {
      const { username, email, password } = data;
      await signupUser(socket, username, email, password);
    });

    // Log-in event
    socket.on('log-in', async (data) => {
      const { username, password } = data;
      await loginUser(socket, username, password);
    });

    // Token verification
    socket.on('verify-token', async (token) => {
      try {
        const result = await verifyToken(token);
        socket.emit('token-verification', result);
      } catch (err) {
        socket.emit('token-verification', { success: false, message: err.message });
      }
    });

    // Get game state event
    socket.on('get-game-state', () => {
      getGameState((state) => {
        socket.emit('game-state', state);
      });
    });

    //bet

    socket.on('place-bet', async (data) => {
      const { userId, gameId, chosenNumbers } = data;

      const result = await placeBet(userId, gameId, chosenNumbers);

      if (result.success) {
          socket.emit('bet_success', result);
      } else {
          socket.emit('bet_failed', result);
      }
    });

    socket.on('get-balance', async (data) => {
      const { userId } = data;
      await getUserBalance(socket, userId);
    });


    socket.on('disconnect', () => {
      console.log('User disconnected');
      });
    });


  server.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
}

createCustomServer();
