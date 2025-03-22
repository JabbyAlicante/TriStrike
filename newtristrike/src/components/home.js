import '../styles/home.css';
import '../styles/home_mq.css';
import webSocketService from '../core/websocketClient';
import store from './store';

export default function HomePage(root) {
    console.log("Initializing HomePage component...");

    const token = localStorage.getItem("authToken");
    console.log("Token retrieved from localStorage:", token);

    if (!token) {
        console.error("❌ No authentication token found. Redirecting to login...");
        window.location.href = "/login";
        return;
    }

    const storedBalance = localStorage.getItem("userBalance");
    if (storedBalance !== null) {
        updateBalance(storedBalance);
    }

    console.log("Attempting to connect WebSocket...");
    webSocketService.connect();

    webSocketService.on("connect", () => {
        console.log("✅ WebSocket re-authenticated");
        webSocketService.send("authenticate", token);

        webSocketService.send("game_update", {});
        webSocketService.send("latest_game_response", {});
        webSocketService.send("get-balance", { token });
        webSocketService.send("prize_pool", {});
    });

    


    //  Timer update 
    webSocketService.on("game_update", (response) => {

        if (typeof response.prizePool !== "undefined") {
            console.log(`🏆 Prize pool update received: ${response.prizePool}`);
            
            const prizePoolElement = document.querySelector(".prize-pool .prize");
            if (prizePoolElement) {
                prizePoolElement.textContent = `${response.prizePool} coins`;
            } else {
                console.error("❌ Prize pool element not found in the DOM");
            }
        } else {
            console.error("⚠️ Prize pool update failed: Invalid response structure");
        }
        // console.log("📦 Game update received:", response);
    
        if (typeof response.timer !== "undefined") {
            // console.log(`🕒 Timer update received: ${response.timer}`);
    
           
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
                        img.src = 'https://res.cloudinary.com/dkympjwqc/image/upload/v1741402544/back_kispbm.png';
                        img.alt = `Card ${digit}`;
                        img.setAttribute('data-card-number', digit);
                        headerCards.appendChild(img);
                    }
                });
            }
        
            const chosenNumbers = [];

            cards.forEach(card => {
                card.addEventListener('click', () => {
                    if (flippedCards.length < 3 && !flippedCards.includes(card)) {
                        card.classList.add('flip');
                        flippedCards.push(card);

                        const chosenNumber = parseInt(card.getAttribute('data-card-number'), 10);
                        console.log(`🃏 Card flipped: ${chosenNumber}`);

                        if (!chosenNumbers.includes(chosenNumber)) {
                            chosenNumbers.push(chosenNumber);
                        }

                        if (chosenNumbers.length === 3) {
                            document.getElementById('place-bet-btn').disabled = false;
                        }

                        if (winningDigits.includes(chosenNumber)) {
                            const headerCard = headerCards.querySelector(`[data-card-number="${chosenNumber}"]`);
                            if (headerCard) {
                                const matchingFace = cardFaces.find(card => card.number === chosenNumber);
                                headerCard.src = matchingFace.url;
                                console.log(`🎯 Correct match! Showing card ${chosenNumber}`);
                                if (!matchedCards.includes(chosenNumber)) {
                                    matchedCards.push(chosenNumber);
                                }
                            }
                        }
                    }

                    if (flippedCards.length === 3) {
                        setTimeout(() => {
                            flippedCards.forEach(card => {
                                const cardNumber = parseInt(card.getAttribute('data-card-number'), 10);
                                if (!matchedCards.includes(cardNumber)) {
                                    card.classList.remove('flip');
                                }
                            });
                            flippedCards = [];
                        }, 1000);
                    }
                });
            });

        } else {
            console.error("⚠️ Fetching Winning Number failed");
        }
        if (response.gameId) {

            sessionStorage.setItem('gameId', response.gameId);
        } else {
            console.error("❌ No gameId received!");
        }
    });

    
    function updateBalance(balance) {
        const balElement = document.querySelector(".money");
        if (balElement) {
            balElement.textContent = `Balance: ${balance} coins`;
            console.log(`✅ Balance updated: ${balance} coins`);
        } else {
            console.error("❌ Error: Balance element not found in the DOM");
        }
    }
    
    
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

    const allCardFaces = [
        ...cardFaces, 
        ...cardFaces.slice(0, cardCount - cardFaces.length)
    ];
    

    // function shuffleCards() {
        
    //     for (let i = allCardFaces.length - 1; i > 0; i--) {
    //         const j = Math.floor(Math.random() * (i + 1));
    //         [allCardFaces[i], allCardFaces[j]] = [allCardFaces[j], allCardFaces[i]];
    //     }
    // }
    // shuffleCards(allCardFaces);

    
    
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
            <button class="bet">Place bet</button>
            
        </div>
    </div>
    `;

    let flippedCards = [];
    let matchedCards = [];
    let betPlaced = false;

    const cards = Array.from(document.querySelectorAll('.card'));
    const placeBetButton = document.querySelector('.bet');

    placeBetButton.addEventListener('click', () => {
        if (betPlaced) {
            console.error("❌ Bet already placed!");
            alert("You have already placed a bet for this round.");
            return;
        }

        if (flippedCards.length !== 3) {
            console.error("❌ You must select exactly 3 cards to place a bet.");
            alert("You must select exactly 3 cards to place a bet.");
            return;
        }

        const chosenNumbers = flippedCards.map(card => 
            parseInt(card.getAttribute('data-card-number'), 10)
        );

        const betAmount = 20;
        const gameId = sessionStorage.getItem("gameId");

        if (!gameId) {
            console.error("❌ No active game found.");
            alert("No active game found. Please start a new game.");
            return;
        }

        const token = localStorage.getItem("authToken"); 

        if (!token) {
            console.error("❌ User not authenticated.");
            alert("Please log in to place a bet.");
            return;
        }

        console.log(`🎯 Placing bet with numbers: ${chosenNumbers.join(', ')}, Amount: ${betAmount}, Game Id: ${gameId}`);

        webSocketService.send("place-bet", { gameId, chosenNumbers, betAmount, token });

        betPlaced = true;
        placeBetButton.disabled = true;

        webSocketService.on('bet_success', (response) => {
            console.log(`✅ Bet successful!`, response);

            // const updatedUserBal = response.balance;
            // localStorage.setItem("updatedUserBal", response.balance);
            // updateBalance(response.balance);

            const updatedUserBal = response.balance;
            sessionStorage.setItem("updatedUserBal", updatedUserBal);
            localStorage.setItem("userBalance", updatedUserBal); 

            const balanceElement = document.getElementById('money');
            balanceElement.textContent = `Balance: ${updatedUserBal} coins`;

            alert(`✅ Bet successful! :D `);

            if (token) {
                webSocketService.send('get-balance', { token });
            }

            resetCards();
        });

        webSocketService.on('bet_failed', (response) => {
            console.error(`❌ Bet failed: ${response.message}`);

            alert(`❌ Bet failed: ${response.message}`);

            betPlaced = false;
            placeBetButton.disabled = false;
        });
    });

    function resetCards() {
        setTimeout(() => {
            flippedCards.forEach(card => {
                const cardNumber = parseInt(card.getAttribute('data-card-number'), 10);
                if (!matchedCards.includes(cardNumber)) {
                    card.classList.remove('flip');
                }
            });

            flippedCards = [];
            betPlaced = false;
            placeBetButton.disabled = false;
        }, 500); 
    }

cards.forEach(card => {
    card.addEventListener('click', () => {
        if (flippedCards.length < 3 && !flippedCards.includes(card)) {
            card.classList.add('flip');
            flippedCards.push(card);

            const chosenNumber = parseInt(card.getAttribute('data-card-number'), 10);
            console.log(`🃏 Card flipped: ${chosenNumber}`);

            if (flippedCards.length === 3) {
                placeBetButton.disabled = false;
            }
        }
    });
});


    

    setTimeout(() => {
        const userProfile = root.querySelector('.user-profile');
        const dropdown = root.querySelector('.dropdown');
        const logoutButton = root.querySelector('#logout');
        const coinButton = root.querySelector('#coinstore');
        // const historyButton = root.querySelector('#history');

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

        if (coinButton) {
            coinButton.addEventListener('click', () => {
                console.log('Redirecting to dashboard...');
                // window.location.href = '/store';
                store(root);
            });
        }


    }, 0);

    document.addEventListener("DOMContentLoaded", () => {
    const storedBalance = localStorage.getItem("userBalance");

    if (storedBalance !== null) {
        updateBalance(storedBalance);
    }
    // const lessBet = localStorage.getItem("updatedUserBal")
    // if (storedBalance == storedBalance) {
    //     updateBalance(lessBet);
    // }

    // else {
    //     const newBalance = localStorage.getItem("newBalance");
    //     updateBalance(newBalance);
    // }
});

}
