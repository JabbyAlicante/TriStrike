import '../styles/home.css';

export default function HomePage(root) {
    const cardCount = 30;

    const cardsHTML = Array.from({ length: cardCount }, (_, index) => `
    <div class="card" data-card-index="${index}" data-face="down">
      <div class="card-inner">
        <div class="card-side card-front" style="background-image: url('https://res.cloudinary.com/dkympjwqc/image/upload/v1741402719/0_f9mspx.png');"></div>
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
          <div class="score">Money: 100</div>
          <div class="icons">
            <img src="icon-settings.png" alt="Settings" />
            <img src="icon-extra.png" alt="Extra" />
          </div>
          <div class="time">00:00</div>
        </div>
      </header>
      

      <section class="game-board">
        <div class="card-grid">
          ${cardsHTML}
        </div>
      </section>
    </div>
    
  `;

  const cards = root.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flip');
    });
  });
}
