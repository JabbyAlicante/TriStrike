import '../styles/store.css';
import webSocketService from '../core/websocketClient';

export default function store(root) {
    root.innerHTML = `
        <div class="body">
            <header class="header">
                <div class="logo" id="logo-img">
                    <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741108692/TriStrikeLogo_eycqvd.png" alt="TriStrike Logo">
                </div>
                <div class="info">
                    <div class="user-balance" id="balance-display">Balance: Loading...</div>

                    <div class="user-img" id="userProfile">
                        <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741419016/icon_ruyyzu.png" alt="User Profile" />
                        <div class="dropdown" id="dropdown">
                            <ul>
                                <li id="home">Home</li>
                                <li id="history">History</li>
                                <li id="logout">Logout</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>

            <div class="dropdown" id="dropdown">
                <ul>
                    <li id="home">Home</li>
                    <li id="history">History</li>
                    <li id="logout">Logout</li>
                </ul>
            </div>

            <!-- Coin Store Section -->
            <div class="store-container">

                <h1>Buy Coins</h1>
                <div class="coin-packages">
                    <div class="package">
                        <div class="coin-icon">🪙</div>
                        <h2>50 Coins</h2>
                        <p>P 60.00</p>
                        <button class="buy-btn" onclick="showPaymentModal(50, 60.00)">Buy</button>
                    </div>
                    <div class="package">
                        <div class="coin-icon">🪙🪙</div>
                        <h2>100 Coins</h2>
                        <p>P 150.00</p>
                        <button class="buy-btn" onclick="showPaymentModal(100, 150.00)">Buy</button>
                    </div>
                    <div class="package">
                        <div class="coin-icon">🪙🪙🪙</div>
                        <h2>500 Coins</h2>
                        <p>P 360.00</p>
                        <button class="buy-btn" onclick="showPaymentModal(500, 360.00)">Buy</button>
                    </div>
                    <div class="package">
                        <div class="coin-icon">🪙🪙🪙🪙</div>
                        <h2>1000 Coins</h2>
                        <p>P 800.00 <span class="bonus">+100 Bonus!</span></p>
                        <button class="buy-btn" onclick="showPaymentModal(1000, 800.00)">Buy</button>
                    </div>
                </div>
            </div>

            <!-- Payment Modal -->
            <div id="paymentModal" class="modal">
                <div class="modal-content">
                    <span class="close-btn" onclick="closeModal()">&times;</span>
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
    
    webSocketService.connect();
    webSocketService.fetchLatestData();


    webSocketService.on("user_balance", (response) => {
        console.log("📦 User balance update received:", response);

        if (typeof response.balance !== "undefined") {
            console.log(`💰 Balance update received: ${response.balance}`);

            const balanceDisplay = document.getElementById("balance-display");
            if (balanceDisplay) {
                console.log("✅ Updating balance text...");
                balanceDisplay.textContent = `Balance: ${response.balance} coins`;
            } else {
                console.error("❌ Error: Balance element not found in the DOM");
            }
        } else {
            console.error("⚠️ Balance update failed: Invalid response structure");
        }
    });

    
    webSocketService.on("buy_coins_response", (response) => {
        console.log("📦 Buy coins update received:", response);
    
        if (response.success) {
           
            const balanceElement = document.getElementById('balance-display');
            balanceElement.textContent = `Balance: ${response.balance} coins`;
            
            alert(`Purchase successful! Your new balance is ${response.balance} coins.`);
        } else {
            alert(`Purchase failed: ${response.errorMessage}`);
        }
    });
    

   
    window.showPaymentModal = (amount, price) => {
        const modal = document.getElementById('paymentModal');
        modal.style.display = 'block';


        const form = document.getElementById('paymentForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

            const userId = localStorage.getItem("userId");
            webSocketService.send("buy_coins", {
        
                amount,
                paymentMethod,
            });

            alert(`${userId}: Processing purchase of ${amount} coins for P${price.toFixed(2)} using ${paymentMethod}.`);
            closeModal();
        };
    };

    
    
    window.closeModal = () => {
        const modal = document.getElementById('paymentModal');
        modal.style.display = 'none';
    };

    
    window.onclick = (event) => {
        const modal = document.getElementById('paymentModal');
        if (event.target === modal) {
            closeModal();
        }
    };

    setTimeout(() => {
        const userProfile = root.querySelector('.user-img');
        const dropdown = root.querySelector('.dropdown');
        const logoutButton = root.querySelector('#logout');
        const homeButton = root.querySelector('#home');
        const logoButton = root.querySelector('#logo-img');

        if (userProfile && dropdown) {
            userProfile.addEventListener('click', (event) => {
                event.stopPropagation();
                dropdown.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                dropdown.classList.remove('show');
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                console.log('🚪 Logging out...');
                localStorage.removeItem('authToken');
                window.location.href = '/';
            });
        }

        if (home) {
            homeButton.addEventListener('click', () => {
                console.log('Redirecting to dashboard...');
                window.location.href = '/home';
            });
        }

        if (logoButton) {
            logoButton.addEventListener('click', () => {
                console.log('Removing token...');
                localStorage.removeItem('authToken');
                window.location.href = '/';
            });
        }


    }, 0);
}
