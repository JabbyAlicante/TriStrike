# TriStrike
Tristrike is a real-time bingo-inspired gambling game built with Express, Vanilla JavaScript, and WebSockets. Players place bets on a combination of three numbers and try to match the winning result. The game features a countdown timer, real-time balance updates, and a virtual betting system.
## Features
- Real-Time Gameplay using Websockets
- 59-second countdown per game round
- Virtual betting system with a starting balance
- Automatic balance update after each round
- Authentication using token-based WebSocket connection
## Tech Stack
| Technology | Purpose |
|-----------|---------|
| Express.js | Backend framework |
| Vanilla JS | Frontend logic |
| Socket.IO | Real-time communication |
| MySQL      | Database |
| Vite       | Development tool for faster builds |
| Node.js    | Runtime environment |
## Installation
1. Clone the repository
`git clone https://github.com/JabbyAlicante/tristrike.git`
2. Navigate the project directory
`cd tristrike`
3. Install Dependencies
`npm install`
4. Create a .env file:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tristrike
JWT_SECRET=your-jwt-secret
