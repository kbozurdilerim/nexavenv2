import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPanel from "./pages/UserPanel";
import Home from "./pages/Home";
import Showcase from "./pages/Showcase";
import Features from "./pages/Features";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/panel" element={<UserPanel />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/features" element={<Features />} />
      </Routes>
    </BrowserRouter>
  );
}
