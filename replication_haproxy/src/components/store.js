import '../styles/store.css';
import HomePage from './home';

export default class Store {
  constructor({ root, socket }) {
    this.root = root;
    this.socket = socket;

    
    // this.updatedBalance = localStorage.getItem("userBalance") || 0;

    
    this.render();
    this.setupEventListeners();
    this.setupSocketListeners();
  }

  render() {
    const updatedBalance = localStorage.getItem("userBalance") || 0;
    this.root.innerHTML = `
      <div class="body">
        <header class="header">
          <div class="logo" id="logo-img">

            <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741108692/TriStrikeLogo_eycqvd.png" alt="TriStrike Logo">
          </div>
          <div class="info">
            <div class="user-img" id="userProfile">
              <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741419016/icon_ruyyzu.png" alt="User Profile" />
              <div class="dropdown" id="dropdown">
                <ul>
                  <li id="home">Home</li>
                  <li id="logout">Logout</li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        <!-- Coin Store Section -->
        
        <div class="store-container">
          <div class="user-balance" id="balance-display">Balance: ${updatedBalance}</div>
          <h1>Buy Coins</h1>
          <div class="coin-packages">
            <div class="package">
              <div class="coin-icon">🪙</div>
              <h2>50 Coins</h2>
              <p>P 60.00</p>
              <button class="buy-btn" data-amount="50" data-price="60.00">Buy</button>
            </div>
            <div class="package">
              <div class="coin-icon">🪙🪙</div>
              <h2>100 Coins</h2>
              <p>P 150.00</p>
              <button class="buy-btn" data-amount="100" data-price="150.00">Buy</button>
            </div>
            <div class="package">
              <div class="coin-icon">🪙🪙🪙</div>
              <h2>500 Coins</h2>
              <p>P 360.00</p>
              <button class="buy-btn" data-amount="500" data-price="360.00">Buy</button>
            </div>
            <div class="package">
              <div class="coin-icon">🪙🪙🪙🪙</div>
              <h2>1000 Coins</h2>
              <p>P 800.00 <span class="bonus">+100 Bonus!</span></p>
              <button class="buy-btn" data-amount="1000" data-price="800.00">Buy</button>
            </div>
          </div>
        </div>

        <!-- Payment Modal -->
        <div id="paymentModal" class="modal">
          <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Select Payment Method</h2>
            <form id="paymentForm">
              <label>
                <input type="radio" name="payment" value="GCash" required>
                <span class="payment-label">GCash</span>
              </label>
              <label>
                <input type="radio" name="payment" value="PayMaya" required>
                <span class="payment-label">PayMaya</span>
              </label>
              <button type="submit" class="confirm-btn">Confirm Payment</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const userProfile = this.root.querySelector("#userProfile");
    const dropdown = this.root.querySelector("#dropdown");
    if (userProfile && dropdown) {
      userProfile.addEventListener("click", (event) => {
        event.stopPropagation();
        dropdown.classList.toggle("show");
      });

      document.addEventListener("click", () => {
        dropdown.classList.remove("show");
      });
    }

    const logoutButton = this.root.querySelector("#logout");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        console.log("🚪 Logging out...");
        localStorage.removeItem("authToken");
        window.location.href = "/";
      });
    }

    const homeButton = this.root.querySelector("#home");
    if (homeButton) {
      homeButton.addEventListener("click", () => {
        console.log("🏠 Redirecting to Home Page...");
        new HomePage({ root: this.root, socket: this.socket });
      });
    }

    const buyButtons = this.root.querySelectorAll(".buy-btn");
    buyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const amount = button.getAttribute("data-amount");
        const price = button.getAttribute("data-price");
        this.showPaymentModal(amount, price);
      });
    });

    
    const modal = this.root.querySelector("#paymentModal");
    const closeModalButton = modal.querySelector(".close-btn");
    closeModalButton.addEventListener("click", () => {
      modal.style.display = "none";
    });
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  setupSocketListeners() {
    this.socket.emit("get_balance");
    this.socket.on("balance_update", (response) => {
      console.log("📥 Balance update received:", response);
      if (response.balance) {
        const balanceDisplay = this.root.querySelector("#balance-display");
        localStorage.setItem("userBalance", response.balance);
        sessionStorage.setItem("updatedUserBal", response.balance);
        if (balanceDisplay) {
          balanceDisplay.textContent = `Balance: ${response.balance} coins`;
        }
      }
    });

    this.socket.on("strike_store_response", (response) => {
      console.log("✅ Purchase successful:", response);
      const balanceDisplay = this.root.querySelector("#balance-display");
      localStorage.setItem("userBalance", response.data.newBalance);
      sessionStorage.setItem("updatedUserBal", response.data.newBalance);
      if (balanceDisplay) {
        balanceDisplay.textContent = `Balance: ${response.data.newBalance} coins`;
      }
      alert(`✅ Purchase successful! Your new balance is ${response.data.newBalance} coins.`);
    });

    // this.socket.on("purchase_failed", (response) => {
    //   console.error("❌ Purchase failed:", response);
    //   alert(`❌ Purchase failed: ${response.message}`);
    // });
  }

  showPaymentModal(amount, price) {
    const modal = this.root.querySelector("#paymentModal");
    const form = this.root.querySelector("#paymentForm");
    modal.style.display = "block";

    form.onsubmit = (event) => {
      event.preventDefault();
      const paymentMethod = form.querySelector('input[name="payment"]:checked').value;
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("❌ User not authenticated!");
        return;
      }

      console.log(`💳 Processing payment: ${amount} coins for P${price} via ${paymentMethod}`);
      this.socket.emit("buy_coins", { token, amount, paymentMethod });
      modal.style.display = "none";
    };
  }
}