import { useState } from "react";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/admin";
      } else {
        setError(data.error || "Giriş başarısız");
      }
    } catch (err) {
      setError("Bağlantı hatası");
    }
  };

  return (
    <div style={{ 
      padding: 40, 
      fontFamily: "Arial, sans-serif", 
      maxWidth: 400, 
      margin: "100px auto",
      border: "1px solid #ddd",
      borderRadius: 8,
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h2>🔐 Admin Girişi</h2>
      
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      
      <input
        placeholder="Kullanıcı Adı"
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 10,
          border: "1px solid #ccc",
          borderRadius: 4
        }}
        onChange={e => setU(e.target.value)}
      />
      
      <input
        placeholder="Şifre"
        type="password"
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 10,
          border: "1px solid #ccc",
          borderRadius: 4
        }}
        onChange={e => setP(e.target.value)}
        onKeyPress={e => e.key === "Enter" && login()}
      />
      
      <button
        onClick={login}
        style={{
          width: "100%",
          padding: 12,
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 16
        }}
      >
        Giriş Yap
      </button>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <a href="/" style={{ color: "#007bff", textDecoration: "none" }}>
          ← Ana Sayfaya Dön
        </a>
      </div>
    </div>
  );
}
