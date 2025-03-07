import '../styles/signup.css';
import LandingPage from './landing';
import LogSignUpPage from './logSignUp';

export default function SignUpPage(root) {
    root.innerHTML = `
      <div class="signup-container" id="signup-id">
        <div class="mini-logo">
            <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741310929/TriStrikeLogo_sikapc.png" alt="">
        </div>
  
          <div class="signup-content">
              <div class="signup-text">
                  <h1>Sign Up</h1>
              </div>
  
              <div class="text-fields">
                  <form id="signup-form" action="">
                      <label class="pure-material-textfield-filled">
                          <input id="email" name="email" placeholder=" " required>
                          <span>Username</span>
                      </label>
                      <label class="pure-material-textfield-filled">
                          <input id="password" placeholder=" " name="password" type="password" required>
                          <span>Password</span>
                      </label>
                      <input class="signup-button" type="submit" value="Sign Up">
                  </form>
  
                  <div id="alertMessage" class="alert" onclick="closeAlert()">
                      <p id="alertText">Please fill in all required fields!</p>
                  </div>
              </div>
          </div>
  
           
      </div>
    `;
  
    const logoButton = root.querySelector(".mini-logo");
    logoButton.addEventListener("click", () => {
      LandingPage(root); 
    });
  
    const logSignUp = root.querySelector(".login-text");
    logSignUp.addEventListener("click", () => {
      LogSignUpPage(root); 
    });

}