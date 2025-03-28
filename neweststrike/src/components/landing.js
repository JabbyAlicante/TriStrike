import LogSignUpPage from './logSignUp';
import '../styles/common.css';
import '../styles/landing_mq.css';
import '../components/sparkleCursor';



export default function LandingPage({ root, socket }) {
//   const component = document.createElement('h1');
  root.innerHTML = `
    <div class="landing-container" id="landing-id">
      <div class="mini-logo1">
            <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741108692/TriStrikeLogo_eycqvd.png" alt="TriStrike">
        </div>
      
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
            
            <p class="tagline">Bet on Fate, Match to Win!</p>

        </div>

        <div class="play-button">
            <button class="play-start" >Play</button>
        </div>
    </div>

    <div class="mini-logo">
        <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741108692/TriStrikeLogo_eycqvd.png" alt="">
    </div>

    <div class="about-container">
        <div class="right-side1">
            <div class="logo-photo1">
                <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741108718/card_olnq8o.png" alt="">
            </div>
        </div>
        <div class="left-side">
            <div class="about-title">
                <div class="tri">
                    <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741097157/title-w_rzvoft.png" alt="Tri">
                </div>
                
                <div class="strike">
                    <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741097157/title-w_rzvoft.png" alt="Strike">
                </div>
                
            </div>

            <div class="description">
                <p class="a_open">Fate is Calling — Match, Bet, and Win Big!</p>
                <p class="desc">Tristrike is a fast-paced card-matching game where players race to match  three identical cards to claim victory.</p>
            </div>
        </div>
        

        <div class="right-side">
            <div class="logo-photo">
                <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741108718/card_olnq8o.png" alt="">
            </div>
        </div>

    </div>


  `;
  const playButton = root.querySelector(".play-start");
  playButton.addEventListener("click", () => {
    if (root instanceof HTMLElement) {
      LogSignUpPage(root, socket);
    } else {
      console.error("❌ root is not a valid DOM element in LandingPage");
    }
  });

}

