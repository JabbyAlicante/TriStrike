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
    });

    const timerElement = root.querySelector('#timer');

    // webSocketService.on("timer_update", (timer) => {
    //     console.log(`🕒 Timer update received: ${timer}`);
    //     const minutes = Math.floor(timer / 60);
    //     const seconds = timer % 60;
    //     timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    //     console.log(`Updated timer text content to: ${timerElement.textContent}`);
    // });

    webSocketService.on("timer_update", (response) => {
      if (response.success) {
  

        console.log(`🕒 Timer update received: ${timer}`);
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        console.log(`Updated timer text content to: ${timerElement.textContent}`)
  
      } else {
        showAlert(response.message);
      }
    });

    const cardCount = 20;
    const cardFaces = [
        'https://res.cloudinary.com/dkympjwqc/image/upload/v1741930982/0_n5znur.png',
        'https://res.cloudinary.com/dkympjwqc/image/upload/v1741930982/1_bf13f8.png',
        'https://res.cloudinary.com/dkympjwqc/image/upload/v1741930982/2_diao4h.png',
        'https://res.cloudinary.com/dkympjwqc/image/upload/v1741930982/3_p429cg.png',
        'https://res.cloudinary.com/dkympjwqc/image/upload/v1741930982/4_wojdgb.png',
        'https://res.cloudinary.com/dkympjwqc/image/upload/v1741930983/5_trggdg.png',
        'https://res.cloudinary.com/dkympjwqc/image/upload/v1741930982/6_o6ffqr.png',
        'https://res.cloudinary.com/dkympjwqc/image/upload/v1741930983/7_evgrzq.png',
        'https://res.cloudinary.com/dkympjwqc/image/upload/v1741930983/8_ljnybq.png',
        'https://res.cloudinary.com/dkympjwqc/image/upload/v1741930983/9_dqpuap.png',
    ];

    function shuffleCards(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    const allCardFaces = [...cardFaces, ...cardFaces.slice(0, cardCount - cardFaces.length)];
    shuffleCards(allCardFaces);

    const cardsHTML = Array.from({ length: cardCount }, (_, index) => `
        <div class="card" data-card-index="${index}" data-face="down">
            <div class="card-inner">
                <div class="card-side card-front" style="background-image: url('${allCardFaces[index % allCardFaces.length]}');"></div>
                <div class="card-side card-back" style="background-image: url('https://res.cloudinary.com/dkympjwqc/image/upload/v1741402544/back_kispbm.png');"></div>
            </div>
        </div>
    `).join('');

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
                <div class="user-profile">
                    <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741419016/icon_ruyyzu.png" alt="User Profile" />
                </div>
                <div class="time" id="timer"></div>
            </div>
        </header>

        <div class="prize-pool">
            <h1 class="pp-name">Prize Pool</h1>
            <h1 class="prize">9999</h1>
        </div>

        <div class="empty">
            <div class="money">Balance: 100</div>
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

    const cards = root.querySelectorAll('.card');
    let flippedCards = 0;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('flip')) {
                card.classList.remove('flip');
                flippedCards--;
            } else if (flippedCards < 3) {
                card.classList.add('flip');
                flippedCards++;
            }
        });
    });
}
