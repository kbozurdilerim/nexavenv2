import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Home from "./pages/Home";

export default function App() {
  const path = window.location.pathname;

  if (path === "/admin") return <Admin />;
  if (path === "/login") return <Login />;

  return <Home />;
}
