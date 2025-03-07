import { useLocation } from "react-router-dom";

const Home = () => {
  const location = useLocation();
  console.log(location.pathname); // ✅ This works

  return <div>Welcome to Landing Page</div>;
};

export default Home;
