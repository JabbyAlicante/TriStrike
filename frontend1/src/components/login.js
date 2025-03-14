import '../styles/login.css';
import LandingPage from './landing';
import LogSignUpPage from './logSignUp';
import HomePage from './home';
import webSocketService from '../core/websocketClient';

export default function LoginPage(root) {
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

  root.querySelector(".mini-logo").addEventListener("click", () => {
    LandingPage(root);
  });

  const logSignUp = root.querySelector(".login-text");
  if (logSignUp) {
    logSignUp.addEventListener("click", () => {
      LogSignUpPage(root);
    });
  }

  const loginForm = root.querySelector("#login-form");
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    
    const username = root.querySelector("#username").value.trim();
    const password = root.querySelector("#password").value.trim();
    
    if (!username || !password) {
      showAlert("Please fill in all required fields!");
      return;
    }

    webSocketService.send("login", { username, password });
  });

  webSocketService.on("login_response", (response) => {
    if (response.success) {
      showAlert("✅ Login successful! Redirecting...");

      localStorage.setItem("authToken", response.token);

      webSocketService.send("authenticate", response.token);

      setTimeout(() => HomePage(root), 2000);
    } else {
      showAlert(response.message);
    }
  });

  function showAlert(message) {
    const alertBox = root.querySelector("#alertMessage");
    const alertText = root.querySelector("#alertText");
    alertText.textContent = message;
    alertBox.style.display = "block";
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 3000);
  }
}
