import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [step, setStep] = useState(1); // 1: Tip seç, 2: Form doldur
  const [userType, setUserType] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTypeSelect = (type) => {
    setUserType(type);
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validasyon
    if (!username || !email || !password) {
      setError("Tüm alanları doldurun");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı");
      return;
    }

    if (userType === "cafe" && !companyName) {
      setError("Şirket adı gerekli");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          userType,
          companyName: userType === "cafe" ? companyName : null
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Kayıt başarılı! Giriş yapabilirsiniz.");
        navigate("/login");
      } else {
        setError(data.error || "Kayıt başarısız");
      }
    } catch (err) {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div style={styles.container}>
        <div style={styles.box}>
          <h1 style={styles.title}>Kayıt Ol</h1>
          <p style={styles.subtitle}>Hesap tipinizi seçin</p>

          <div style={styles.typeGrid}>
            <div style={styles.typeCard} onClick={() => handleTypeSelect("individual")}>
              <div style={styles.typeIcon}>👤</div>
              <h3 style={styles.typeTitle}>Bireysel Hesap</h3>
              <p style={styles.typeText}>
                Kişisel kullanım için lisans satın alın.
                Tek kullanıcılı lisans sistemi.
              </p>
              <button style={styles.typeBtn}>Seç</button>
            </div>

            <div style={styles.typeCard} onClick={() => handleTypeSelect("cafe")}>
              <div style={styles.typeIcon}>🏢</div>
              <h3 style={styles.typeTitle}>Simulasyon Cafe</h3>
              <p style={styles.typeText}>
                Cafe işletmeniz için toplu lisans.
                Çoklu bilgisayar desteği.
              </p>
              <button style={styles.typeBtn}>Seç</button>
            </div>
          </div>

          <div style={styles.footer}>
            <span>Zaten hesabınız var mı? </span>
            <Link to="/login" style={styles.link}>Giriş Yap</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <button style={styles.backBtn} onClick={() => setStep(1)}>
          ← Geri
        </button>

        <h1 style={styles.title}>
          {userType === "individual" ? "Bireysel Hesap" : "Simulasyon Cafe"}
        </h1>
        <p style={styles.subtitle}>Bilgilerinizi girin</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          {userType === "cafe" && (
            <input
              type="text"
              placeholder="Şirket/Cafe Adı"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={styles.input}
              required
            />
          )}

          <input
            type="password"
            placeholder="Şifre (min. 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Şifre Tekrar"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Zaten hesabınız var mı? </span>
          <Link to="/login" style={styles.link}>Giriş Yap</Link>
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
    padding: "40px 50px",
    borderRadius: 16,
    border: "1px solid rgba(0, 183, 255, 0.3)",
    maxWidth: 900,
    width: "100%",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    background: "transparent",
    border: "1px solid rgba(0, 183, 255, 0.5)",
    color: "#00b7ff",
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  title: {
    fontSize: 32,
    marginBottom: 10,
    textAlign: "center",
    color: "#00b7ff",
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 40,
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 20,
    marginBottom: 30,
  },
  typeCard: {
    background: "rgba(10, 14, 39, 0.6)",
    padding: 30,
    borderRadius: 12,
    border: "2px solid rgba(0, 183, 255, 0.2)",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  typeIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  typeTitle: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 15,
  },
  typeText: {
    fontSize: 14,
    color: "#aaa",
    lineHeight: 1.6,
    marginBottom: 20,
  },
  typeBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #00b7ff, #0066ff)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  input: {
    padding: "14px 18px",
    background: "rgba(10, 14, 39, 0.6)",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
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
  },
  footer: {
    marginTop: 25,
    textAlign: "center",
    color: "#aaa",
    fontSize: 14,
  },
  link: {
    color: "#00b7ff",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
