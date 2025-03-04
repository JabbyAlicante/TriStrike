import JSLogo from '../icons/javascript.svg';
import '../styles/common.css';
import '../styles/landing_mq.css';



export default function Welcome(root) {
//   const component = document.createElement('h1');
  root.innerHTML = `
      <div class="landing-container" id="landing-id">
      
        <div class="horo-wheel">
            <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741096973/Horoscope_Wheel_jrt0h6.png" alt="Horoscope Wheel">
        </div>

        <div class="card-logo">
            <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741097149/ccc_o8dtav.png" alt="Cards">
        </div>

        <div class="welcome-title">
            <div class="tri">
                <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741097157/title-w_rzvoft.png" alt="Tri">
            </div>
            
            <div class="strike">
                <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741097157/title-w_rzvoft.png" alt="Strike">
            </div>
        </div>

        <div class="play-button">
            <button class="play-start">Play</button>
        </div>
    </div>
  `;

//   root.appendChild(root);
}
