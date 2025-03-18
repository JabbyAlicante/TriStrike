import SignUpPage from "../components/signup";
import Layout from "../layouts/default";

export default function SignUp() {
    const { main } = Layout(this.root);

    SignUpPage(main);
}