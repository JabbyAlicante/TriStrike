import HomePage from "../components/home";
import Layout from "../layouts/default";

export default function Home() {
    const { main } = Layout(this.root);

    HomePage(main);
}