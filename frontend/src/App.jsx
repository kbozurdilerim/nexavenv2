import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Showcase from "./pages/Showcase";
import Features from "./pages/Features";

export default function App() {
  const path = window.location.pathname;

  if (path === "/admin") return <Admin />;
  if (path === "/login") return <Login />;
  if (path === "/showcase") return <Showcase />;
  if (path === "/features") return <Features />;

  return <Home />;
}
