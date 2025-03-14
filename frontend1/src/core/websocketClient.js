import { io } from "socket.io-client";

const WS_URL = "http://localhost:3000"; 

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = {};
        this.isConnected = false;
    }

    connect() {
        if (!this.socket) {
            const token = localStorage.getItem("authToken");
            
            console.log(`Attempting to connect with token: ${token}`);
            this.socket = io(WS_URL, {
                transports: ["websocket"],
                auth: { token },
            });

            this.socket.on("connect", () => {
                console.log("✅ WebSocket connected");
                this.isConnected = true;

                if (token) {
                    this.send("authenticate", token);
                }
            });

            this.socket.on("disconnect", () => {
                console.log("❌ WebSocket disconnected");
                this.isConnected = false;
                this.socket = null;
            });

            this.socket.on("connect_error", (error) => {
                console.error("⚠️ WebSocket connection error:", error);
            });

            this.socket.on("error", (error) => {
                console.error("⚠️ WebSocket error:", error);
            });

            this.socket.onAny((event, payload) => {
                console.log(`📦 Event received: ${event} with payload:`, payload);
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
            console.error("❌ WebSocket is not connected. Retrying in 1 second...");
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
}


const webSocketService = new WebSocketService();
export default webSocketService;
