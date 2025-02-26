import { Server } from "socket.io";
import { loginUser, registerUser } from "../services/userService.js";
// import { startGameService, getGameState } from "../services/gameService.js";

export default function setupWebSocket(httpServer) {
    const io = new Server(httpServer, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("login", async ({ username, password }) => {
            const result = await loginUser(username, password);
            socket.emit(result.success ? "loginSuccess" : "loginError", result);
        });

        socket.on("register", async ({ username, password }) => {
            console.log("Register request received:", data);
            const result = await registerUser(username, password);
            console.log("Register result:", result);
            socket.emit(result.success ? "registerSuccess" : "registerError", result);
        });

        // socket.emit("game_update", getGameState());

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    // startGameService(io);
}
