import "../styles/signup.css";
import LandingPage from "./landing";
import LogSignUpPage from "./logSignUp";
import LoginPage from "./login";

export default function SignUpPage(root, socket) {
    if (!socket || !socket.connected) {
        console.warn("⚠️ Socket not connected, attempting to reconnect...");
        socket.connect();
    }

    root.innerHTML = `
      <div class="signup-container" id="signup-id">
        <div class="mini-logo">
            <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741310929/TriStrikeLogo_sikapc.png" alt="">
        </div>
  
        <div class="signup-content">
            <div class="signup-text">
                <h1>Sign Up</h1>
            </div>
  
            <div class="text-fields">
                <form id="signup-form">
                    <label class="pure-material-textfield-filled">
                        <input id="username" name="username" placeholder=" " required>
                        <span>Username</span>
                    </label>
                    <label class="pure-material-textfield-filled">
                        <input id="email" name="email" placeholder=" " required>
                        <span>Email</span>
                    </label>
                    <label class="pure-material-textfield-filled">
                        <input id="password" name="password" type="password" placeholder=" " required>
                        <span>Password</span>
                    </label>
                    <input class="signup-button" type="submit" value="Sign Up">
                </form>
  
                <div id="alertMessage" class="alert">
                    <p id="alertText"></p>
                </div>
            </div>
        </div>
      </div>
    `;

    root.querySelector(".mini-logo").addEventListener("click", () => {
        console.log("🏠 Redirecting to Landing Page...");
        LandingPage(root, socket);
    });

    const logSignUp = root.querySelector(".login-text");
    if (logSignUp) {
        logSignUp.addEventListener("click", () => {
            console.log("✍️ Redirecting to Login Page...");
            LoginPage(root, socket);
        });
    }

    const signupForm = root.querySelector("#signup-form");
    signupForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const username = root.querySelector("#username").value.trim();
        const email = root.querySelector("#email").value.trim();
        const password = root.querySelector("#password").value.trim();

        if (!username || !email || !password) {
            console.warn("⚠️ Missing fields");
            showAlert("Please fill in all required fields!");
            return;
        }

        console.log("📤 Sending 'sign-up' event:", { username, email, password });

        socket.emit("sign-up", { username, email, password });
    });

    socket.off("signup-response");
    socket.on("signup-response", (response) => {
        console.log("📥 Received signup response:", response);

        if (response.success) {
            console.log("✅ Signup successful:", response);
            showAlert("✅ Signup successful! Redirecting...");

            setTimeout(() => {
                LoginPage(root, socket);
            }, 2000);
        } else {
            console.error("❌ Signup failed:", response.message);
            showAlert(response.message);
        }
    });

    function showAlert(message) {
        console.log("🚨 Alert:", message);
        const alertBox = root.querySelector("#alertMessage");
        const alertText = root.querySelector("#alertText");
        alertText.textContent = message;
        alertBox.style.display = "block";
        setTimeout(() => {
            alertBox.style.display = "none";
        }, 3000);
    }
}
