// const socketService = (() => {
//     let socket = null;
//     let isConnected = false;
  
//     async function initialize() {
//       if (typeof window === 'undefined') return;
  
//       if (window.__IO__) {
//         socket = window.__IO__;
//         isConnected = true;
//         console.log('✅ Using existing socket instance');
//         return;
//       }
  
//       window.__IO__ = io('http://localhost:3000');
//       socket = window.__IO__;
//       isConnected = true;
  
//       socket.on('connect', () => {
//         isConnected = true;
//         console.log('✅ Connected to socket');
//       });
  
//       socket.on('disconnect', () => {
//         isConnected = false;
//         console.log('❌ Disconnected from socket');
//       });
//     }
  
//     return {
//       initialize,
//       getSocket: () => socket,
//       isSocketConnected: () => isConnected
//     };
//   })();
  
//   export default socketService;
  