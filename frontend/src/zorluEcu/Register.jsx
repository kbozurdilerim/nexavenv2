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
    <div style={{ maxWidth: 420 }}>
      <h3>Zorlu ECU — Kayıt</h3>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Kullanıcı adı" value={form.username} onChange={e => setField("username", e.target.value)} />
        <input placeholder="Email" type="email" value={form.email} onChange={e => setField("email", e.target.value)} />
        <input placeholder="Şifre" type="password" value={form.password} onChange={e => setField("password", e.target.value)} />
        <select value={form.userType} onChange={e => setField("userType", e.target.value)}>
          <option value="individual">Bireysel</option>
          <option value="company">Şirket</option>
        </select>
        {form.userType === "company" && (
          <input placeholder="Şirket adı" value={form.companyName} onChange={e => setField("companyName", e.target.value)} />
        )}
        {msg && <div style={{ color: "seagreen" }}>{msg}</div>}
        {error && <div style={{ color: "crimson" }}>{error}</div>}
        <button type="submit">Kayıt Ol</button>
      </form>
      <div style={{ marginTop: 8 }}>
        Zaten hesabın var mı? <Link to="/zorlu.ecu/login">Giriş yap</Link>
      </div>
    </div>
  );
}
