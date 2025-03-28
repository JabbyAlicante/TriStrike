import "../styles/signup.css";
import LandingPage from "./landing";
import LogSignUpPage from "./logSignUp";
import LoginPage from "./login";

export default class SignUpPage {
    constructor({ root, socket }) {
        this.root = root;
        this.socket = socket;

        this.render();
        this.setupEventListeners();
    }

    render() {
        console.log("🔌 Connecting to WebSocket signin...");

        if (!this.socket || !this.socket.connected) {
            console.warn("⚠️ Socket not connected");
        }

        this.root.innerHTML = `
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
    }

    setupEventListeners() {
        this.root.querySelector(".mini-logo").addEventListener("click", () => {
            console.log("🏠 Redirecting to Landing Page...");
            new LandingPage({ root: this.root, socket: this.socket });
        });

        const logSignUp = this.root.querySelector(".signup-text");
        if (logSignUp) {
            logSignUp.addEventListener("click", () => {
                console.log("✍️ Redirecting to Sign Up Page...");
                new LogSignUpPage({ root: this.root, socket: this.socket });
            });
        }

        const signupForm = this.root.querySelector("#signup-form");
        if (signupForm) {
            signupForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const username = this.root.querySelector("#username").value.trim();
                const email = this.root.querySelector("#email").value.trim();
                const password = this.root.querySelector("#password").value.trim();

                if (!username || !email || !password) {
                    console.warn("⚠️ Missing fields");
                    this.showAlert("Please fill in all required fields!");
                    return;
                }

                if (!this.socket || !this.socket.connected) {
                    this.showAlert("Socket not connected. Please wait...");
                    return;
                }

                console.log("📤 Sending signup request:", { username, email, password });

                this.socket.emit("sign-up", { username, email, password });
            });
        }

        this.socket.on("signup-response", (response) => {
            console.log("📥 Received signup response:", response);

            if (response.success) {
                console.log("✅ Signup successful:", response);
                this.showAlert("✅ Signup successful! Redirecting...");

                setTimeout(() => {
                    new LoginPage({ root: this.root, socket: this.socket });
                }, 2000);
            } else {
                console.error("❌ Signup failed:", response.message);
                this.showAlert(response.message);
            }
        });
    }

    showAlert(message) {
        console.log("🚨 Alert:", message);
        const alertBox = this.root.querySelector("#alertMessage");
        const alertText = this.root.querySelector("#alertText");
        alertText.textContent = message;
        alertBox.style.display = "block";
        setTimeout(() => {
            alertBox.style.display = "none";
        }, 3000);
    }
}
