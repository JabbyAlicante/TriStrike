import LandingPage from '../components/landing.js';
import Layout from '../layouts/default.js';

export default function Landing() {
  const { main } = Layout(this.root);

  LandingPage(main);
}

