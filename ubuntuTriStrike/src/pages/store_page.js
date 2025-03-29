import store from "../components/store";
import Layout from "../layouts/default";

export default function StoreStrike() {
    const { main } = Layout(this.root);

    store(main);
}