import '../styles/home.css';
import '../styles/home_mq.css';
import store from './store';

const HomePage = class {
  constructor({ root, socket, cardCount = 15 }) {
    this.root = root;
    this.socket = socket;
    this.cardCount = cardCount; 


    this.cardFaces = [
      { number: 0, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992368/0_t5bmuh.png' },
      { number: 1, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992368/1_swhmis.png' },
      { number: 2, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992368/2_wv0nep.png' },
      { number: 3, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992368/3_lnwl2b.png' },
      { number: 4, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992368/4_ep0sdj.png' },
      { number: 5, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992369/5_rw57g6.png' },
      { number: 6, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992368/6_z4acoj.png' },
      { number: 7, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992369/7_uttbwr.png' },
      { number: 8, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992369/8_kuok18.png' },
      { number: 9, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992369/9_rqficb.png' },
      { number: 10, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992369/10_btmivq.png' },
      { number: 11, url: 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741992369/11_zxjz82.png' }
    ];

   
    this.allCardFaces = [
      ...this.cardFaces,
      ...this.cardFaces.slice(0, this.cardCount - this.cardFaces.length)
    ];

    this.flippedCards = [];
    this.matchedCards = [];
    this.cards = [];

    this.verifyToken();
    this.render();
    this.setupSocketListeners();
    this.setupUIEventListeners();
  }

  verifyToken() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("❌ No authentication token found. Redirecting to login...");
      window.location.href = "/login";
    } else {
      console.log("Token verified:", token);
    }
  }

  setupSocketListeners() {
    if (!this.socket || !this.socket.connected) {
      console.warn("⚠️ Socket not connected");
    }
    this.socket.on("state_update", this.handleGameUpdate.bind(this));
    this.socket.on("balance_update", (data) => {
      console.log("📥 Received balance update:", data);
      localStorage.setItem("userBalance", data.balance);
      this.updateBalance(data.balance);
    });
    this.socket.on("connect", () => {
      console.log("✅ Socket reconnected on HomePage. Re-authenticating...");
      const token = localStorage.getItem("authToken");
      if (token) {
        this.socket.emit("authenticate", token);
      }
    });
  }


  generateCardsHTML() {
   
    let allCardFaces = [...this.allCardFaces];

   
    // function shuffleCards(cards) {
    //   for (let i = cards.length - 1; i > 0; i--) {
    //     const j = Math.floor(Math.random() * (i + 1));
    //     [cards[i], cards[j]] = [cards[j], cards[i]];
    //   }
    // }
    // shuffleCards(allCardFaces);

    
    const cardsHTML = Array.from({ length: this.cardCount }, (_, index) => {
      const card = allCardFaces[index % allCardFaces.length];
      return `
        <div class="card" data-card-index="${index}" data-face="down" data-card-number="${card.number}">
          <div class="card-inner">
            <div class="card-side card-front" style="background-image: url('${card.url}');"></div>
            <div class="card-side card-back" style="background-image: url('https://res.cloudinary.com/dkympjwqc/image/upload/v1741402544/back_kispbm.png');"></div>
          </div>
        </div>
      `;
    }).join('');
    return cardsHTML;
  }

  handleGameUpdate(response) {
    
    if (typeof response.prizePool !== "undefined") {
      console.log(`🏆 Prize pool update received: ${response.prizePool}`);
      const prizePoolElement = this.root.querySelector(".prize-pool .prize");
      if (prizePoolElement) {
        prizePoolElement.textContent = `${response.prizePool} coins`;
      } else {
        console.error("❌ Prize pool element not found in the DOM");
      }
    } else {
      console.error("⚠️ Prize pool update failed: Invalid response structure");
    }

    
    if (typeof response.timer !== "undefined") {
      setTimeout(() => {
        const timerElement = this.root.querySelector("#timer");
        if (!timerElement) {
          console.error("❌ Timer element not found in the DOM");
          return;
        }
        const minutes = Math.floor(response.timer / 60);
        const seconds = response.timer % 60;
        timerElement.textContent = `Next draw in: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }, 100);
    } else {
      console.error("⚠️ Timer update failed: Invalid response structure");
    }

    
    if (response.winningNumber) {
      console.log(`🎰 Winning Number update received: ${response.winningNumber}`);
      const winningDigits = String(response.winningNumber).split('-').map(Number);
      const headerCards = this.root.querySelector('.header .logo .cards');
      if (headerCards) {
        headerCards.innerHTML = '';
        winningDigits.forEach((digit) => {
          
          const matchingCard = this.cardFaces.find((card) => card.number === digit);
          if (matchingCard) {
            const img = document.createElement('img');
            
            img.src = 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741402544/back_kispbm.png';
            img.alt = `Card ${digit}`;
            img.setAttribute('data-card-number', digit);
            headerCards.appendChild(img);
          }
        });
      } else {
        console.error("❌ Winner display area not found in the DOM");
      }

      
      const chosenNumbers = [];
      if (this.cards && this.cards.length > 0) {
        this.cards.forEach((card) => {
          card.addEventListener('click', () => {
            if (this.flippedCards.length < 3 && !this.flippedCards.includes(card)) {
              card.classList.add('flip');
              this.flippedCards.push(card);
              const chosenNumber = parseInt(card.getAttribute('data-card-number'), 10);
              console.log(`🃏 Card flipped: ${chosenNumber}`);
              if (!chosenNumbers.includes(chosenNumber)) {
                chosenNumbers.push(chosenNumber);
              }
              if (chosenNumbers.length === 3) {
                const betBtn = this.root.querySelector('#place-bet-btn');
                if (betBtn) {
                  betBtn.disabled = false;
                }
              }
              if (winningDigits.includes(chosenNumber)) {
                const headerCard = headerCards.querySelector(`[data-card-number="${chosenNumber}"]`);
                if (headerCard) {
                  const matchingFace = this.cardFaces.find((card) => card.number === chosenNumber);
                  headerCard.src = matchingFace.url;
                  console.log(`🎯 Correct match! Showing card ${chosenNumber}`);
                  if (!this.matchedCards.includes(chosenNumber)) {
                    this.matchedCards.push(chosenNumber);
                  }
                }
              }
            }
            if (this.flippedCards.length === 3) {
              setTimeout(() => {
                this.flippedCards.forEach((card) => {
                  const cardNumber = parseInt(card.getAttribute('data-card-number'), 10);
                  if (!this.matchedCards.includes(cardNumber)) {
                    card.classList.remove('flip');
                  }
                });
                this.flippedCards = [];
              }, 1000);
            }
          });
        });
      }
    } else {
      console.error("⚠️ Winning Number update failed");
    }

    
    if (response.gameId) {
      sessionStorage.setItem('gameId', response.gameId);
    } else {
      console.error("❌ No gameId received!");
    }
  }

  updateBalance(balance) {
    const moneyEl = this.root.querySelector("#money");
    if (moneyEl) {
      moneyEl.textContent = `Balance: ${balance} coins`;
    }
  }

  render() {
    const storedBalance = localStorage.getItem("userBalance") || 0;
    const cardsHTML = this.generateCardsHTML();
    this.root.innerHTML = `
      <div class="body">
        <header class="header">
          <div class="logo">
            <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741108692/TriStrikeLogo_eycqvd.png" alt="Logo">
            <div class="cards">
              ${cardsHTML}
            </div>
          </div>
          <div class="info">
            <div class="user-profile" id="userProfile">
              <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741419016/icon_ruyyzu.png" alt="User Profile" />
              <div class="dropdown" id="dropdown">
                <ul>
                  <li id="coinstore">Coin Store</li>
                  <li id="logout">Logout</li>
                </ul>
              </div>
            </div>
            <div class="timer" id="timer">Next draw in: --:--</div>
          </div>
        </header>

        <section class="game-board">
          <div class="card-grid">
            ${cardsHTML}
          </div>
        </section>

        <div class="bottom-nav">
          <p class="money" id="money">Balance: ${storedBalance} coins</p>
          <div class="prize-pool">
            <h1 class="pp-name">Prize Pool</h1>
            <h1 class="prize">--</h1>
          </div>
          <button class="bet" id="place-bet-btn" disabled>Place bet</button>
        </div>
      </div>
    `;
    
    this.cards = Array.from(this.root.querySelectorAll('.card'));
  }

  
  setupUIEventListeners() {
    
    const logoElem = this.root.querySelector(".logo");
    if (logoElem) {
      logoElem.addEventListener("click", () => {
        console.log("🏠 Redirecting to Landing Page...");
        window.location.href = "/landing";
      });
    }
   
    const logoutEl = this.root.querySelector("#logout");
    if (logoutEl) {
      logoutEl.addEventListener("click", () => {
        console.log("Logging out...");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      });
    }
    
    const coinstoreEl = this.root.querySelector("#coinstore");
    if (coinstoreEl) {
      coinstoreEl.addEventListener("click", () => {
        console.log("Opening coin store...");
        // Coinstore open
      });
    }
  }

  
};

export default HomePage;