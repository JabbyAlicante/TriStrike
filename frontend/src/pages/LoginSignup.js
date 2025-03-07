import LogSignUpPage from '../components/logSignUp.js';
import Layout from '../layouts/default.js';

export default function AuthSelection() {
  const { main } = Layout(this.root);
 
  LogSignUpPage(main);

}
