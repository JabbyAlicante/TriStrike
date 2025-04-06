# Tristrike

## 🛠️ Tech Stack
| Technology | Purpose |
|-----------|---------|
| Express.js | Backend framework |
| Vanilla JS | Frontend logic |
| Socket.IO | Real-time communication |
| MySQL      | Database |
| Vite       | Development tool for faster builds |
| Node.js    | Runtime environment |
## 📥 Installation
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
```
5. Set up the database:
   - Use XAMPP to start MySQL (or you can you use ubuntu)
   - Create a database named `tristrike`
   - Import the provided `.sql` file in `backend/database`
## 🚀 Running the Project
```npm run dev```
## 👨‍💻 Code Overview
### Backend (Express.js)
| File/Folder | Purpose |
|------------|---------|
| `server.js` | Sets up the Express server and listens for events from clients |
| `services` | Manages the logic and WebSocket connections |
| `db.js` | Handles MySQL connection and queries |
### Frontend (Vanilla JS)
| File/Folder | Purpose |
|------------|---------|
| `components` | Contains logic and event emits (e.g., handling button clicks, sending data to the server via WebSocket). |
| `Core` | Houses core functionality like `spa.js` (Single Page Application handling) and `websocketclients.js` (WebSocket connection logic). |
| `icons` | Contains SVG files for logos and icons used in the UI. |
| `layouts` | Stores reusable layout components like headers, footers, and navigation bars. |
| `pages` | Contains individual page components (e.g., home page, login page). |
| `style` | Stores CSS or styling files to define the application's look and feel. |
| `index.html` | The main HTML file that acts as the entry point for the app. |
| `main.js` | The main JavaScript file that initializes the app and sets up core functionality. |
