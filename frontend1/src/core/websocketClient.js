import { io } from "socket.io-client";

const WS_URL = "http://localhost:3000"; 

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = {};
    }

    connect() {
        if (!this.socket) {
            const token = localStorage.getItem("authToken");
            
            this.socket = io(WS_URL, {
                transports: ["websocket"],
                auth: { token },
            });

            this.socket.on("connect", () => {
                console.log("✅ WebSocket connected");

                if (token) {
                    this.send("authenticate", token);
                }
            });

            this.socket.on("disconnect", () => console.log("❌ WebSocket disconnected"));
            this.socket.on("connect_error", (error) => console.error("⚠️ WebSocket error:", error));

            this.socket.onAny((event, payload) => {
                if (this.listeners[event]) {
                    this.listeners[event](payload);
                }
            });
        }
    }

    send(event, payload) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, payload);
        } else {
            console.error("❌ WebSocket is not connected.");
        }
    }

    on(event, callback) {
        this.listeners[event] = callback;
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
