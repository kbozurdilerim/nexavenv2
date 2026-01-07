import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import "./theme.css";
import { useEffect, useState } from "react";
import { apiGet } from "./api";

export default function ZorluLayout() {
  const location = useLocation();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isAuthPage = location.pathname === "/zorlu.ecu/login" || location.pathname === "/zorlu.ecu/register";

  if (!token && !isAuthPage) {
    return <Navigate to="/zorlu.ecu/login" replace />;
  }

  const [me, setMe] = useState(null);
  useEffect(() => {
    (async () => {
      if (!token) return;
      try { const m = await apiGet("/auth/me"); setMe(m); } catch {}
    })();
  }, [token]);

  const isActive = (href) => (location.pathname === href ? "active" : "");

  return (
    <div data-zorlu-ecu style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="zorlu-aside">
        <h2 className="zorlu-brand">Zorlu ECU</h2>
        <p className="zorlu-sub">AI Learning • Tuning • Chat</p>
        <nav className="zorlu-nav">
          <Link className={isActive("/zorlu.ecu/dashboard")}
                to="/zorlu.ecu/dashboard">Dashboard</Link>
          <Link className={isActive("/zorlu.ecu/ai.learning")}
                to="/zorlu.ecu/ai.learning">AI Learning</Link>
          <Link className={isActive("/zorlu.ecu/tuning")}
                to="/zorlu.ecu/tuning">Tuning</Link>
          <Link className={isActive("/zorlu.ecu/chat")}
                to="/zorlu.ecu/chat">Chat</Link>
          {me?.role === "admin" && (
            <Link className={isActive("/zorlu.ecu/admin")} to="/zorlu.ecu/admin">Admin</Link>
          )}
          {token ? (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/zorlu.ecu/login";
              }}
              style={{ marginTop: 8 }}
            >
              Çıkış Yap
            </button>
          ) : (
            <>
              <Link className={isActive("/zorlu.ecu/login")} to="/zorlu.ecu/login">Giriş</Link>
              <Link className={isActive("/zorlu.ecu/register")} to="/zorlu.ecu/register">Kayıt</Link>
            </>
          )}
        </nav>
        {me && <div className="muted" style={{ marginTop: 10 }}>{me.username} · {me.role}</div>}
      </aside>
      <main className="zorlu-main">
        <Outlet />
      </main>
    </div>
  );
}
