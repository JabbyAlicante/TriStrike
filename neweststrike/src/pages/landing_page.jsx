import LandingPage from '../components/landing.js';
import Layout from '../layouts/default.js';

export default function Landing(socket, root) {
  if (!root) {
    console.error('❌ root is undefined in Landing');
    return;
  }

  const { main } = Layout(root);
  LandingPage({ root: main, socket });
}
