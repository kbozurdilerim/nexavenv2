import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ZorluRegister() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", userType: "individual", companyName: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function setField(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/register/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMsg(data.message || "Kayıt başarılı");
      setTimeout(() => nav("/zorlu.ecu/login", { replace: true }), 800);
    } catch (err) {
      setError("Kayıt başarısız. Alanları kontrol edin.");
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
          <h2 style={{ margin: 0, fontSize: 28, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Kayıt Ol</h2>
          <div className="muted" style={{ fontSize: 13 }}>Dakikalar içinde başlayın</div>
        </div>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input placeholder="Kullanıcı adı" value={form.username} onChange={e => setField("username", e.target.value)} style={{ padding: 12 }} />
          <input placeholder="Email" type="email" value={form.email} onChange={e => setField("email", e.target.value)} style={{ padding: 12 }} />
          <input placeholder="Şifre" type="password" value={form.password} onChange={e => setField("password", e.target.value)} style={{ padding: 12 }} />
          <select value={form.userType} onChange={e => setField("userType", e.target.value)} style={{ padding: 12 }}>
            <option value="individual">Bireysel</option>
            <option value="company">Şirket</option>
          </select>
          {form.userType === "company" && (
            <input placeholder="Şirket adı" value={form.companyName} onChange={e => setField("companyName", e.target.value)} style={{ padding: 12 }} />
          )}
          {msg && <div style={{ background: "rgba(0,255,100,0.15)", border: "1px solid seagreen", color: "seagreen", padding: 10, borderRadius: 6 }}>{msg}</div>}
          {error && <div style={{ background: "rgba(255,77,79,0.15)", border: "1px solid var(--accent)", color: "var(--accent)", padding: 10, borderRadius: 6 }}>{error}</div>}
          <button type="submit" style={{ padding: 12, fontWeight: 600 }}>Kayıt Ol</button>
        </form>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          Zaten hesabın var mı? <Link to="/zorlu.ecu/login">Giriş yap</Link>
        </div>
      </div>
    </div>
  );
}
