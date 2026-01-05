import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        
        // Kullanıcı bilgisini al ve role'e göre yönlendir
        const userRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        const userData = await userRes.json();
        
        if (userData.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/panel");
        }
      } else {
        setError(data.error || "Giriş başarısız");
      }
    } catch (err) {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>NEXAVEN</div>
          <p style={styles.subtitle}>Hoş Geldiniz</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Kullanıcı adınızı girin"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Şifrenizi girin"
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Henüz hesabınız yok mu? </span>
          <Link to="/register" style={styles.link}>Kayıt Ol</Link>
        </div>

        <div style={styles.backHome}>
          <Link to="/" style={styles.homeLink}>← Ana Sayfaya Dön</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: 20,
  },
  box: {
    background: "rgba(26, 31, 58, 0.9)",
    padding: "50px 60px",
    borderRadius: 16,
    border: "1px solid rgba(0, 183, 255, 0.3)",
    maxWidth: 450,
    width: "100%",
    boxShadow: "0 8px 32px rgba(0, 183, 255, 0.1)",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    background: "linear-gradient(90deg, #00b7ff, #0066ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: 4,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#aaa",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#00b7ff",
    fontWeight: "500",
  },
  input: {
    padding: "14px 18px",
    background: "rgba(10, 14, 39, 0.6)",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    transition: "border-color 0.3s",
  },
  error: {
    padding: "12px",
    background: "rgba(220, 53, 69, 0.2)",
    border: "1px solid #dc3545",
    borderRadius: 8,
    color: "#ff6b6b",
    fontSize: 14,
    textAlign: "center",
  },
  submitBtn: {
    padding: "14px",
    background: "linear-gradient(135deg, #00b7ff, #0066ff)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 10,
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 15px rgba(0, 183, 255, 0.3)",
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
  },
  footerText: {
    color: "#aaa",
    fontSize: 14,
  },
  link: {
    color: "#00b7ff",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "color 0.3s",
  },
  backHome: {
    marginTop: 20,
    textAlign: "center",
  },
  homeLink: {
    color: "#666",
    textDecoration: "none",
    fontSize: 14,
    transition: "color 0.3s",
  },
};
