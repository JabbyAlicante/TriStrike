import SignUpPage from "../components/signup";
import Layout from "../layouts/default";

export default function SignUp(root) {
    const { main } = Layout(root);

    SignUpPage(main);
}