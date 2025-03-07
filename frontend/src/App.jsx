import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LoginSignup from "./pages/LoginSignup";
// import Login from "./pages/Login";
// import SignUp from "./pages/SignUp";
// import Game from "./pages/Game";
// import Profile from "./pages/Profile";
// import Leaderboard from "./pages/Leaderboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login-signup" element={<LoginSignup />} />
                {/* <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/game" element={<Game />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} /> */}
            </Routes>
        </Router>
    );
}

export default App;
