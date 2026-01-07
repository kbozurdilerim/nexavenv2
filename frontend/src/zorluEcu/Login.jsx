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
    <div style={{ maxWidth: 360 }}>
      <h3>Zorlu ECU — Giriş</h3>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Kullanıcı adı" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Şifre" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div style={{ color: "crimson" }}>{error}</div>}
        <button type="submit">Giriş Yap</button>
      </form>
      <div style={{ marginTop: 8 }}>
        Hesabın yok mu? <Link to="/zorlu.ecu/register">Kayıt ol</Link>
      </div>
    </div>
  );
}
