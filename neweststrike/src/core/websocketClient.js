// import { io } from "socket.io-client";

// const socket = io("http://localhost:3000", {
//   transports: ["websocket", "polling"],
// });

// const webSocketService = {
//   connect: () => {
//     socket.on("connect", () => {
//       console.log("✅ Connected to WebSocket:", socket.id);
//     });

//     socket.on("disconnect", () => {
//       console.log("❌ Disconnected from WebSocket");
//     });
//   },

//   send: (event, data) => {
//     console.log(`📤 Sending event: ${event}`, data);
//     socket.emit(event, data);
//   },

//   on: (event, callback) => {
//     socket.on(event, callback);
//   },

//   off: (event) => {
//     socket.off(event);
//   },
// };

// export default webSocketService;
