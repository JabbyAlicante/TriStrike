import DashboardPage from "../components/dashboard";
import Layout from "../layouts/default";

export default function Dashboard() {
    const { main } = Layout(this.root);

    DashboardPage(main);
}