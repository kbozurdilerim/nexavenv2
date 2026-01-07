import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Main routes
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPanel from "./pages/UserPanel";
import Home from "./pages/Home";
import Showcase from "./pages/Showcase";
import Features from "./pages/Features";

// Zorlu ECU lazy loaded
const ZorluLayout = lazy(() => import("./zorluEcu/Layout"));
const ZorluLogin = lazy(() => import("./zorluEcu/Login"));
const ZorluRegister = lazy(() => import("./zorluEcu/Register"));
const ZorluDashboard = lazy(() => import("./zorluEcu/Dashboard"));
const ZorluAILearning = lazy(() => import("./zorluEcu/AILearning"));
const ZorluTuning = lazy(() => import("./zorluEcu/Tuning"));
const ZorluChat = lazy(() => import("./zorluEcu/Chat"));
const ZorluAdmin = lazy(() => import("./zorluEcu/Admin"));

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: 18, color: "#666" }}>
      Yükleniyor...
    </div>
  );
}

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
        {/* Zorlu ECU isolated route group with lazy loading */}
        <Route path="/zorlu.ecu" element={<Suspense fallback={<LoadingSpinner />}><ZorluLayout /></Suspense>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="login" element={<Suspense fallback={<LoadingSpinner />}><ZorluLogin /></Suspense>} />
          <Route path="register" element={<Suspense fallback={<LoadingSpinner />}><ZorluRegister /></Suspense>} />
          <Route path="dashboard" element={<Suspense fallback={<LoadingSpinner />}><ZorluDashboard /></Suspense>} />
          <Route path="ai.learning" element={<Suspense fallback={<LoadingSpinner />}><ZorluAILearning /></Suspense>} />
          <Route path="tuning" element={<Suspense fallback={<LoadingSpinner />}><ZorluTuning /></Suspense>} />
          <Route path="chat" element={<Suspense fallback={<LoadingSpinner />}><ZorluChat /></Suspense>} />
          <Route path="admin" element={<Suspense fallback={<LoadingSpinner />}><ZorluAdmin /></Suspense>} />
        </Route>
        {/* Alias: dashed path to support /zorlu-ecu */}
        <Route path="/zorlu-ecu" element={<Suspense fallback={<LoadingSpinner />}><ZorluLayout /></Suspense>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="login" element={<Suspense fallback={<LoadingSpinner />}><ZorluLogin /></Suspense>} />
          <Route path="register" element={<Suspense fallback={<LoadingSpinner />}><ZorluRegister /></Suspense>} />
          <Route path="dashboard" element={<Suspense fallback={<LoadingSpinner />}><ZorluDashboard /></Suspense>} />
          <Route path="ai.learning" element={<Suspense fallback={<LoadingSpinner />}><ZorluAILearning /></Suspense>} />
          <Route path="tuning" element={<Suspense fallback={<LoadingSpinner />}><ZorluTuning /></Suspense>} />
          <Route path="chat" element={<Suspense fallback={<LoadingSpinner />}><ZorluChat /></Suspense>} />
          <Route path="admin" element={<Suspense fallback={<LoadingSpinner />}><ZorluAdmin /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
