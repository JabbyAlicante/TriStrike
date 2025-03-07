import '../styles/logSignUp.css';

export default function LogSignUpPage(root) {
  root.innerHTML = `
    <div class="logSignUp-container" id="logSignUp-id">
      <div class="mini-logo">
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

  const loginButton = root.querySelector(".login");
  loginButton.addEventListener("click", () => {
    LogSignUpPage(root); 
  });
}


