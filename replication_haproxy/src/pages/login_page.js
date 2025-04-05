import LoginPage from '../components/login.js';
import Layout from '../layouts/default.js';

export default function Login(root) {
  const { main } = Layout(this.root);
  LoginPage(main);
}
