import LogSignUpPage from '../components/logSignUp.js';
import Layout from '../layouts/default.js';

export default function AuthSelection(root, socket) {
  const { main } = Layout(root);
  LogSignUpPage(main, socket);
}
