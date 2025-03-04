import Counter from '../components/counter/component';
// import Navigation from '../components/navigation';
import Welcome from '../components/welcome';
import Layout from '../layouts/default';

export default function Home() {
  const { navigation, main } = Layout(this.root);

  // Navigation(navigation);
  Welcome(main);
  Counter(main);
}

