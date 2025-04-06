import '../styles/login.css';
import '../styles/login_mq.css';
import LandingPage from './landing';
import LogSignUpPage from './logSignUp';
import HomePage from './home';

export default class LoginPage {
  constructor({ root, socket }) {
    this.root = root;
    this.socket = socket;

    this.render();
    this.setupEventListeners();
    this.verifyToken();
  }

  render() {
    console.log("🔌 Connecting to WebSocket login...");
  
    if (this.socket.connected) {
      console.log("Socket connected");
    }

    if (!this.socket || !this.socket.connected) {
      console.warn("⚠️ Socket not connected");
    }


   
    this.root.innerHTML = `
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
  }

  async checkServerStatus() {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        console.log('✅ Server is online');
        return true;
      } else {
        console.warn('⚠️ Server responded with an error');
        return false;
      }
    } catch (error) {
      console.error('❌ Server is offline:', error);
      return false;
    }
  }

  setupEventListeners() {
    this.root.querySelector(".mini-logo").addEventListener("click", async () => {
      console.log("🏠 Redirecting to Landing Page...");

      const isServerOnline = await this.checkServerStatus();
      if (!isServerOnline) {
        this.showAlert("🚧 Server is under maintenance. Please try again later.");
        return;
      }

      new LandingPage({ root: this.root, socket: this.socket }); 
    });

    const logSignUp = this.root.querySelector(".login-text");
    if (logSignUp) {
      logSignUp.addEventListener("click", () => {
        console.log("✍️ Redirecting to Sign Up Page...");
        new LogSignUpPage({ root: this.root, socket: this.socket }); 
      });
    }

    const loginForm = this.root.querySelector("#login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = this.root.querySelector("#username").value.trim();
        const password = this.root.querySelector("#password").value.trim();

        if (!username || !password) {
          this.showAlert("Please fill in all required fields!");
          return;
        }

        // ---------------------Check server status before logging in-------------------------
        const isServerOnline = await this.checkServerStatus();
        if (!isServerOnline) {
          this.showAlert("🚧 Server is under maintenance. Please try again later.");
          return;
        }

        if (!this.socket || !this.socket.connected) {
          this.showAlert("Socket not connected. Please wait...");
          return;
        }

        console.log("📤 Sending login request:", { username, password });
        this.socket.emit("log-in", { username, password });
      });
    }

    this.socket.on("login-response", (response) => {
      console.log("📥 Received login response:", response);

      if (response.success) {
        console.log("✅ Login successful:", response);

        this.showAlert("✅ Login successful! Redirecting...");

        localStorage.setItem("authToken", response.token);
        sessionStorage.setItem("userId", response.user.id);
        localStorage.setItem("userBalance", response.user.balance);
        console.log("💰 User balance:", response.user.balance);

        setTimeout(() => {
          console.log("➡️ Redirecting to Home Page...");
          new HomePage({ root: this.root, socket: this.socket });
        }, 2000);
      } else {
        console.error("❌ Login failed:", response.message);
        this.showAlert(response.message);
      }
    });
  }

  verifyToken() {
    const token = localStorage.getItem("authToken");
    if (token) {
      console.log("🔑 Token detected:", token);
    } else {
      console.log("No token found. User may need to log in.");
    }
  }

  showAlert(message) {
    const alertText = this.root.querySelector("#alertText");
    const alertMessage = this.root.querySelector("#alertMessage");
    if (alertText && alertMessage) {
      alertText.textContent = message;
      alertMessage.style.display = "block";
    } else {
      console.error("Alert elements not found in the DOM.");
    }
  }
}

