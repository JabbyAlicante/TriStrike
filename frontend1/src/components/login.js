import '../styles/login.css';
import LandingPage from './landing';
import LogSignUpPage from './logSignUp';

export default function LoginPage(root) {
  root.innerHTML = `
    <div class="login-container" id="login-id">
      <div class="mini-logo">
          <img src="https://res.cloudinary.com/dkympjwqc/image/upload/v1741310929/TriStrikeLogo_sikapc.png" alt="">
      </div>

        <div class="login-content">
            <div class="login-text">
                <h1>Login</h1>
            </div>

            <div class="text-fields">
                <form id="login-form" action="">
                    <label class="pure-material-textfield-filled">
                        <input id="email" name="email" placeholder=" " required>
                        <span>Username</span>
                    </label>
                    <label class="pure-material-textfield-filled">
                        <input id="password" placeholder=" " name="password" type="password" required>
                        <span>Password</span>
                    </label>
                    <input class="login-button" type="submit" value="Login">
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