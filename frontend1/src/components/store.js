import '../styles/store.css';

export default function store(root) {
    root.innerHTML = `
        <div class="body">
            <header class="header">
                <div class="logo">
                    <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741108692/TriStrikeLogo_eycqvd.png" alt="TriStrike Logo">
                </div>
                <div class="info">
                    <div class="user-profile" id="userProfile">
                        <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741419016/icon_ruyyzu.png" alt="User Profile" />
                        <div class="dropdown" id="dropdown">
                            <ul>
                                <li id="history">History</li>
                                <li id="logout">Logout</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>

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

    window.showPaymentModal = (amount, price) => {
        const modal = document.getElementById('paymentModal');
        modal.style.display = 'block';

        const form = document.getElementById('paymentForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
            alert(`You bought ${amount} coins for $${price.toFixed(2)} using ${paymentMethod}!`);
            closeModal();
        };
    };

    // Close modal
    window.closeModal = () => {
        document.getElementById('paymentModal').style.display = 'none';
    };

    // Close on outside click
    window.onclick = (event) => {
        const modal = document.getElementById('paymentModal');
        if (event.target === modal) {
            closeModal();
        }
    };
}
