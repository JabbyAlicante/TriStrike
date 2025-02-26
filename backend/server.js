import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import setupWebSocket from "./config/socket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
setupWebSocket(httpServer);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
