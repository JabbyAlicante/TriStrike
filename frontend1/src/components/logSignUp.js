import '../styles/logSignUp.css';
import LandingPage from './landing';
import LoginPage from './login';
import SignUpPage from './signup';

export default function LogSignUpPage(root) {
  root.innerHTML = `
 
  <div class="logSignUp-container" id="logSignUp-id">
    <div class="mini-logo-ls">
      <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741310929/TriStrikeLogo_sikapc.png" alt="">
    </div>
      <div class="ls-content">

        <div class="choices">
          <h1>Choose Your Destiny</h1>
        </div>

        <div class="card-holder">
          <div class="login">
            <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741324538/35_p2qddc.png" alt="Login">
            <h3>Login</h3> 
            <p>Don’t stop now—your next big win is waiting!</p>
          </div>

          <div class="sign-up">
            <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741324538/36_hs3ild.png" alt="Sign Up">
            <h3>Sign Up</h3>
            <p>Sign up now and receive free 100 cosmic coins!</p>
          </div>
        
        </div>
      </div>
  </div>
 
  `;

  const logoButton = root.querySelector(".mini-logo-ls");
  logoButton.addEventListener("click", () => {
    LandingPage(root); 
  });

  const loginButton = root.querySelector(".login");
  loginButton.addEventListener("click", () => {
    LoginPage(root); 
  });

  const signUpButton = root.querySelector(".sign-up");
  signUpButton.addEventListener("click", () => {
    SignUpPage(root); 
  });
}


