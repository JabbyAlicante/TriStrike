import LandingPage from '../components/landing.js';
import Layout from '../layouts/default.js';

export default function Home() {
  const { main } = Layout(this.root);

  LandingPage(main);
}

