import LogSignUpPage from "../components/logSignUp";
import Layout from "../layouts/default";

export default function LoginSignup() {
    const { main } = Layout(this.root);
   
    LogSignUpPage(main);
  
  }