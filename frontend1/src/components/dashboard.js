import '../styles/dashboard.css';
import webSocketService from '../core/websocketClient';

export default function DashboardPage(root) {
  // Set up the HTML structure
  root.innerHTML = `
    <div class="user-dashboard">
      <h2>Buy Coins</h2>
      <div class="coin-buttons">
        <button id="buy-1000">Buy 1000 Coins</button>
        <button id="buy-100">Buy 100 Coins</button>
        <button id="buy-50">Buy 50 Coins</button>
        <button id="buy-20">Buy 20 Coins</button>
      </div>
      <p class="money">Balance: 0 coins</p> <!-- This class matches the selector in home.js -->

      <h2>Game History</h2>
      <ul id="game-history" class="history-list">
      
      </ul>
    </div>
  `;


  function addCoins(amount) {
    console.log(`🛒 Adding ${amount} coins...`);
    webSocketService.emit('coinPurchase', { amount }); 
  }

  
  function renderGameHistory(history) {
    const historyList = document.getElementById('game-history');
    historyList.innerHTML = ''; 

    history.forEach((entry) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${entry.timestamp} | Bet: ${entry.chosen_nums.join('-')} | Amount: ${entry.amount} | ${entry.is_winner ? 'WIN' : 'LOSS'}`;
      historyList.appendChild(listItem);
    });
  }

 
  document.getElementById('buy-1000').addEventListener('click', () => addCoins(1000));
  document.getElementById('buy-100').addEventListener('click', () => addCoins(100));
  document.getElementById('buy-50').addEventListener('click', () => addCoins(50));
  document.getElementById('buy-20').addEventListener('click', () => addCoins(20));

  
  webSocketService.on("user_balance", (response) => {
    console.log("📦 User balance update received:", response);

    if (typeof response.balance !== "undefined") {
      console.log(`💰 Balance update received: ${response.balance}`);

      
      const balElement = document.querySelector(".money");
      if (!balElement) {
        console.error("❌ Error: Balance element not found in the DOM");
        return;
      }

      console.log("✅ Updating balance text...");
      balElement.textContent = `Balance: ${response.balance} coins`;
    } else {
      console.error("⚠️ Balance update failed: Invalid response structure");
    }
  });


  function fetchUserHistory(userId) {
    webSocketService.emit('fetchHistory', { userId }, (response) => {
      if (response.success) {
        renderGameHistory(response.history);
      } else {
        console.warn("⚠️ No game history found or error retrieving data.");
      }
    });
  }


  const userId = 1;
  fetchUserHistory(userId); 
}
