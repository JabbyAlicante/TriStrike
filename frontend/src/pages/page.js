// import Navigation from '../components/navigation';
import Layout from '../layouts/default';

export default function Page(params) {
  const { navigation, main } = Layout(this.root);

  // Navigation(navigation);

  main.innerHTML = `
    <h1>Your are on page: ${params?.id}</h1>
  `;

  for (let i = 1; i < 10; i++) {
    main.innerHTML += `<a href="/pages/${i}">${i}</a>&nbsp;`
  }
}

