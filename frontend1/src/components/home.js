import '../styles/home.css';
import webSocketService from '../core/websocketClient';

export default function HomePage(root) {
    console.log("Initializing HomePage component...");

    const token = localStorage.getItem("authToken");
    console.log("Token retrieved from localStorage:", token);

    if (!token) {
        console.error("❌ No authentication token found. Redirecting to login...");
        window.location.href = "/login";
        return;
    }

    console.log("Attempting to connect WebSocket...");
    webSocketService.connect();

    webSocketService.on("connect", () => {
        console.log("✅ WebSocket re-authenticated");
        webSocketService.send("authenticate", token);

        webSocketService.send("game_update", {});
        webSocketService.send("latest_game_response", {});
        webSocketService.send("user_balance", {});
    });


    //  Timer update 
    webSocketService.on("game_update", (response) => {
        // console.log("📦 Game update received:", response);
    
        if (typeof response.timer !== "undefined") {
            console.log(`🕒 Timer update received: ${response.timer}`);
    
           
            setTimeout(() => {
                const timerElement = document.getElementById("timer");
                if (!timerElement) {
                    console.error("❌ Error: Timer element not found in the DOM");
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
    
            const headerCards = document.querySelector('.header .logo .cards');
    
            if (headerCards) {
                headerCards.innerHTML = '';
    
               
                winningDigits.forEach(digit => {
                    const cardFace = cardFaces.find(card => card.number === digit);
                    if (cardFace) {
                        const img = document.createElement('img');
                        img.src = cardFace.url;
                        img.alt = `Card ${digit}`;
                        headerCards.appendChild(img);
                    }
                });
            }
        } else {
            console.error("⚠️ Fetching Winning Number failed");
        }

        // Game id
        if (response.gameId) {
            // console.log(`🎯 Game started! Game ID: ${response.gameId}`);
            sessionStorage.setItem('gameId', response.gameId);
        } else {
            console.error("❌ No gameId received!");
        }

    });

    
    webSocketService.on("user_balance", (response) => {
        console.log("📦 User balance update received:", response);
    
        if (typeof response.balance !== "undefined") {
            console.log(`💰 Balance update received: ${response.balance}`);
    
            // Use querySelector for class-based selection
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
    
    


    const cardCount = 15;
    const cardFaces = [
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

    function shuffleCards(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    const allCardFaces = [
        ...cardFaces, 
        ...cardFaces.slice(0, cardCount - cardFaces.length)
    ];
    shuffleCards(allCardFaces);
    
    const cardsHTML = Array.from({ length: cardCount }, (_, index) => {
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

    
    

    root.innerHTML = `
    <div class="body">
        <header class="header">
            <div class="logo">
                <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741108692/TriStrikeLogo_eycqvd.png" alt="">
                <div class="cards">
                    <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741404897/1_fez030.png" alt="Winning Card" />
                    <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741404897/1_fez030.png" alt="Winning Card" />
                    <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741404897/1_fez030.png" alt="Winning Card" />
                </div>
            </div>
            <div class="info">
                <div class="user-profile" id="userProfile">
                    <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741419016/icon_ruyyzu.png" alt="User Profile" />
                    <div class="dropdown" id="dropdown">
                        <ul>
                            <li id="dashboard">Dashboard</li>
                            <li id="leaderboard">Leaderboard</li>
                            <li id="logout">Logout</li>
                        </ul>
                    </div>
                </div>

                <div class="timer" id="timer">Next draw in: --:--</div>
            </div>
        </header>

        <div class="prize-pool">
            <h1 class="pp-name">Prize Pool</h1>
            <h1 class="prize">--</h1>
        </div>

        <div class="empty">
            <div class="money">Balance: --</div>
        </div>

        <section class="game-board">
            <div class="card-grid">
                ${cardsHTML}
            </div>
        </section>

        <div class="bet-button">
            <button class="bet">Place bet</button>
        </div>
    </div>
    `;

    
    let flippedCards = [];
    let betPlaced = false;

    // const cardsContainer = document.querySelector('.cards-container');
    const cards = Array.from(document.querySelectorAll('.card'));

    
    const placeBetButton = document.querySelector('.bet');
    placeBetButton.addEventListener('click', () => {
        if (!betPlaced) {
            betPlaced = true;
            alert("✅ Bet placed! Now flip exactly 3 cards.");
            console.log("✅ Bet placed. Start flipping cards.");
        } else {
            if (flippedCards.length !== 3) {
                console.error("❌ You must select exactly 3 cards to place a bet.");
                alert("You must select exactly 3 cards to place a bet.");
                return;
            }

            const chosenNumbers = flippedCards.map(card => parseInt(card.getAttribute('data-card-number'), 10));
            const betAmount = 20; 
            const gameId = sessionStorage.getItem("gameId"); 

            if (!gameId) {
                console.error("❌ No active game found.");
                alert("No active game found. Please start a new game.");
                return;
            }

            console.log(`🎯 Placing bet with numbers: ${chosenNumbers.join(', ')}, Amount: ${betAmount}, Game Id: ${gameId}`);

            webSocketService.send("place_bet", { gameId, chosenNumbers, betAmount });

           
            flippedCards.forEach(card => card.classList.remove('flip'));
            flippedCards = [];
            betPlaced = false;
        }
    });

    // Card flipping
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (!betPlaced) {
                alert("🚫 You must place a bet before flipping cards!");
                console.error("❌ You must place a bet before flipping cards.");
                return;
            }

            if (flippedCards.length < 3 && !flippedCards.includes(card)) {
                card.classList.add('flip');
                flippedCards.push(card);
                console.log(`🃏 Card flipped: ${card.getAttribute('data-card-number')}`);
            }
        });
    });

    webSocketService.on("game_end", () => {
        betPlaced = false;
        flippedCards = [];
        shuffleCards();
    });

    

    //  Manual refresh button
    const refreshButton = document.createElement("button");
    refreshButton.textContent = "🔄 Refresh Data";
    refreshButton.classList.add("refresh-btn");
    refreshButton.addEventListener("click", () => {
        console.log("🔄 Manually refreshing game data...");
        webSocketService.send("game_update", {});
        webSocketService.send("latest_game_response", {});
        webSocketService.send("user_balance", {});
    });
    root.appendChild(refreshButton);

    setTimeout(() => {
        const userProfile = root.querySelector('.user-profile');
        const dropdown = root.querySelector('.dropdown');
        const logoutButton = root.querySelector('#logout');

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
                window.location.href = '/login';
            });
        }
    }, 0);
}
