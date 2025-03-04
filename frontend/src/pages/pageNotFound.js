import Navigation from '../components/navigation';
import Layout from '../layouts/default';

export default function PageNotFound() {
  const { navigation, main } = Layout(this.root);

  Navigation(navigation);
  main.innerHTML = '<h1>Page Not Found</h1>'
}
