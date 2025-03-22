import { io } from "socket.io-client";

const WS_URL = "http://localhost:3000";

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = {};
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        if (!this.socket) {
            console.log(`🌐 Attempting to connect...`);

            this.socket = io(WS_URL, {
                transports: ["websocket"], 
            });

            this.socket.on("connect", () => {
                console.log("✅ WebSocket connected");
                this.isConnected = true;
                this.reconnectAttempts = 0;

                this.fetchLatestData();

                const token = localStorage.getItem("authToken");
                if (token) {
                    console.log("🔑 Sending log-in event after connection...");
                    this.send("log-in", { token });
                }
            });

            this.socket.on("disconnect", () => {
                console.warn("❌ WebSocket disconnected");
                this.isConnected = false;
                this.socket = null;

                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
                    console.log(`🔄 Reconnecting in ${delay / 1000} seconds...`);
                    setTimeout(() => this.connect(), delay);
                } else {
                    console.error("❌ Max reconnect attempts reached. Giving up.");
                }
            });

            this.socket.on("connect_error", (error) => {
                console.error("⚠️ WebSocket connection error:", error);
                this.isConnected = false;
            });

            this.socket.on("error", (error) => {
                console.error("⚠️ WebSocket error:", error);
            });

            this.socket.onAny((event, payload) => {
                if (this.listeners[event]) {
                    this.listeners[event](payload);
                }
            });
        }
    }

    send(event, payload) {
        if (this.isConnected) {
            console.log(`📤 Sending event: ${event} with payload:`, payload);
            this.socket.emit(event, payload);
        } else {
            console.warn(`❌ WebSocket is not connected. Retrying event "${event}" in 1 second...`);
            setTimeout(() => this.send(event, payload), 1000);
        }
    }

    on(event, callback) {
        this.listeners[event] = callback;
    }

    disconnect() {
        if (this.socket) {
            console.log("🔌 Disconnecting WebSocket");
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    fetchLatestData() {
        if (this.isConnected) {
            console.log("🔄 Fetching latest game data...");
            this.send("latest_game_response", {});
            this.send("game_update", {});
            this.send("get-balance", {});
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
