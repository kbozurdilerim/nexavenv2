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
          headers: { Authorization: data.token }
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
    background: "linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1419 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  box: {
    background: "linear-gradient(145deg, rgba(15, 20, 35, 0.95), rgba(10, 14, 26, 0.98))",
    padding: "60px 70px",
    borderRadius: 24,
    border: "2px solid rgba(0, 183, 255, 0.15)",
    maxWidth: 480,
    width: "100%",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 183, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    position: "relative",
    zIndex: 1,
  },
  logoSection: {
    textAlign: "center",
    marginBottom: 50,
    position: "relative",
  },
  logo: {
    fontSize: 48,
    fontWeight: "900",
    background: "linear-gradient(135deg, #4dd4ff 0%, #0099ff 50%, #0066cc 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: 6,
    marginBottom: 15,
    textShadow: "0 0 30px rgba(0, 183, 255, 0.3)",
    filter: "drop-shadow(0 4px 12px rgba(0, 183, 255, 0.4))",
    position: "relative",
  },
  subtitle: {
    fontSize: 16,
    color: "#7a8ba0",
    margin: 0,
    fontWeight: "300",
    letterSpacing: 1,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    position: "relative",
  },
  label: {
    fontSize: 13,
    color: "#4dd4ff",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  input: {
    padding: "16px 20px",
    background: "linear-gradient(145deg, rgba(5, 10, 20, 0.8), rgba(10, 15, 28, 0.9))",
    border: "1.5px solid rgba(0, 183, 255, 0.2)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(0, 183, 255, 0)",
    outline: "none",
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
    padding: "18px",
    background: "linear-gradient(135deg, #0099ff 0%, #0066cc 100%)",
    color: "#fff",
    border: "2px solid rgba(0, 183, 255, 0.3)",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: "700",
    cursor: "pointer",
    marginTop: 15,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 25px rgba(0, 153, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    textTransform: "uppercase",
    letterSpacing: 2,
    position: "relative",
    overflow: "hidden",
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
