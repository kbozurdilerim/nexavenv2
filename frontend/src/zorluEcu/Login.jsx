import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ZorluLogin() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem("token", data.token);
      nav("/zorlu.ecu/dashboard", { replace: true });
    } catch (err) {
      setError("Giriş başarısız. Bilgilerinizi kontrol edin.");
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 28, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Zorlu ECU</h2>
          <div className="muted" style={{ fontSize: 13 }}>Yapay Zeka Destekli ECU Platformu</div>
        </div>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input placeholder="Kullanıcı adı" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: 12 }} />
          <input placeholder="Şifre" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 12 }} />
          {error && <div style={{ background: "rgba(255,77,79,0.15)", border: "1px solid var(--accent)", color: "var(--accent)", padding: 10, borderRadius: 6 }}>{error}</div>}
          <button type="submit" style={{ padding: 12, fontWeight: 600 }}>Giriş Yap</button>
        </form>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          Hesabın yok mu? <Link to="/zorlu.ecu/register">Kayıt ol</Link>
        </div>
      </div>
    </div>
  );
}
