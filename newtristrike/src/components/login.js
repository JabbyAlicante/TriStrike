import '../styles/login.css';
import LandingPage from './landing';
import LogSignUpPage from './logSignUp';
import HomePage from './home';
import webSocketService from '../core/websocketClient';

export default function LoginPage(root) {
  console.log("🔌 Connecting to WebSocket...");
  webSocketService.connect();

  root.innerHTML = `
    <div class="login-container" id="login-id">
      <div class="mini-logo">
          <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741310929/TriStrikeLogo_sikapc.png" alt="TriStrike Logo">
      </div>

      <div class="login-content">
        <div class="login-text">
            <h1>Login</h1>
        </div>

        <div class="text-fields">
            <form id="login-form">
                <label class="pure-material-textfield-filled">
                    <input id="username" name="username" placeholder=" " required>
                    <span>Username</span>
                </label>
                <label class="pure-material-textfield-filled">
                    <input id="password" placeholder=" " name="password" type="password" required>
                    <span>Password</span>
                </label>
                <input class="login-button" type="submit" value="Login">
            </form>

            <div id="alertMessage" class="alert">
                <p id="alertText"></p>
            </div>
        </div>
      </div>
    </div>
  `;

  const token = localStorage.getItem("authToken");
  if (token) {
    console.log("✅ Token exists in localStorage:", token);

    console.log("🔒 Authenticating with existing token...");
    webSocketService.send("authenticate", token);

    setTimeout(() => {
      console.log("➡️ Redirecting to Home Page...");
      HomePage(root);
    }, 1000);
  }

  root.querySelector(".mini-logo").addEventListener("click", () => {
    console.log("🏠 Redirecting to Landing Page...");
    LandingPage(root);
  });

  const logSignUp = root.querySelector(".login-text");
  if (logSignUp) {
    logSignUp.addEventListener("click", () => {
      console.log("✍️ Redirecting to Sign Up Page...");
      LogSignUpPage(root);
    });
  }

  const loginForm = root.querySelector("#login-form");
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = root.querySelector("#username").value.trim();
    const password = root.querySelector("#password").value.trim();

    if (!username || !password) {
      console.warn("⚠️ Missing fields");
      showAlert("Please fill in all required fields!");
      return;
    }

    console.log("📤 Sending login request:", { username, password });

    webSocketService.send("log-in", { username, password });
  });

    webSocketService.on("login-response", (response) => {
    console.log("📥 Received login response:", response);
  
    if (response.success) {
      console.log("✅ Login successful:", response);
  
      showAlert("✅ Login successful! Redirecting...");

      localStorage.setItem("authToken", response.token);
      sessionStorage.setItem("userId", response.user.id);
      localStorage.setItem("userBalance", response.user.balance);
      console.log("💰 User balance:", response.user.balance);
      // updateBalance(response.user.balance);

      console.log("💾 Token and userId saved");
      console.log("🔍 Checking token in localStorage:", localStorage.getItem("authToken"));

      console.log("🔒 Authenticating...");
      webSocketService.send("authenticate", response.token);
  
      setTimeout(() => {
        console.log("➡️ Redirecting to Home Page...");
        HomePage(root);
      }, 2000);
    } else {
      console.error("❌ Login failed:", response.message);
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
