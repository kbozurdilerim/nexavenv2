import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Features() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cms")
      .then(r => r.json())
      .then(data => {
        setFeatures(data.features || []);
        setLoading(false);
      })
      .catch(() => {
        // Eğer API hatası varsa, örnek veriyle devam et
        setFeatures([
          { id: 1, icon: "🎮", title: "Kontrol Paneli", description: "Sunucu performansını izleyin" },
          { id: 2, icon: "🖥️", title: "Sunucu Listesi", description: "Sunucularınızı kolayca yönetin" }
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>NEXAVEN</div>
        </header>
        <div style={{ padding: 100, textAlign: "center", fontSize: 24, color: "#00b7ff" }}>
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>NEXAVEN</div>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>Ana Sayfa</Link>
          <Link to="/showcase" style={styles.navLink}>Araç Vitrini</Link>
          <Link to="/features" style={styles.navLinkActive}>Özellikler</Link>
          <Link to="/login" style={styles.navLink}>Giriş</Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>NEXAVEN ÖZELLİKLERİ</h1>
        <p style={styles.heroSubtitle}>Sadelik ve Performansın Buluştuğu Dijital Platform</p>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <div style={styles.featureGrid}>
          {features.map(feature => (
            <div key={feature.id} style={styles.featureCard}>
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureText}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Nexaven.com.tr Örnek Sayfalar</h2>
        <p style={styles.ctaText}>
          Kontrol Paneli • Sunucu Listesi • Lig & Etkinlikler • İstatistikler
        </p>
        <Link to="/login" style={styles.ctaBtn}>Şimdi Başlayın</Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 NEXAVEN - Yarış Tutkunları için Güçlü Bir Platform</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    margin: 0,
    padding: 0,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
    color: "#fff",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 60px",
    background: "rgba(10, 14, 39, 0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(0, 183, 255, 0.2)",
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    background: "linear-gradient(90deg, #00b7ff, #0066ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: 3,
  },
  nav: {
    display: "flex",
    gap: 30,
  },
  navLink: {
    color: "#fff",
    textDecoration: "none",
    fontSize: 16,
    transition: "color 0.3s",
    cursor: "pointer",
  },
  navLinkActive: {
    color: "#00b7ff",
    textDecoration: "none",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },
  hero: {
    padding: "100px 60px 60px",
    textAlign: "center",
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: "bold",
    marginBottom: 20,
    letterSpacing: 3,
    color: "#00b7ff",
  },
  heroSubtitle: {
    fontSize: 22,
    color: "#aaa",
  },
  features: {
    padding: "40px 60px 80px",
    maxWidth: 1400,
    margin: "0 auto",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: 30,
  },
  featureRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: 30,
    marginBottom: 30,
  },
  featureCard: {
    background: "rgba(26, 31, 58, 0.6)",
    padding: 40,
    borderRadius: 16,
    border: "1px solid rgba(0, 183, 255, 0.2)",
    transition: "transform 0.3s, border-color 0.3s",
    cursor: "pointer",
  },
  featureIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 28,
    marginBottom: 15,
    color: "#fff",
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 16,
    color: "#aaa",
    lineHeight: 1.8,
  },
  cta: {
    padding: "100px 60px",
    textAlign: "center",
    background: "linear-gradient(135deg, rgba(0, 183, 255, 0.1), rgba(0, 102, 255, 0.1))",
    borderTop: "1px solid rgba(0, 183, 255, 0.2)",
  },
  ctaTitle: {
    fontSize: 42,
    marginBottom: 20,
    color: "#fff",
  },
  ctaText: {
    fontSize: 20,
    marginBottom: 40,
    color: "#aaa",
  },
  ctaBtn: {
    display: "inline-block",
    padding: "18px 50px",
    background: "linear-gradient(135deg, #00b7ff, #0066ff)",
    color: "#fff",
    textDecoration: "none",
    borderRadius: 8,
    fontSize: 20,
    fontWeight: "bold",
    boxShadow: "0 6px 30px rgba(0, 183, 255, 0.5)",
    transition: "transform 0.3s",
  },
  footer: {
    padding: "40px 60px",
    textAlign: "center",
    background: "rgba(10, 14, 39, 0.95)",
    borderTop: "1px solid rgba(0, 183, 255, 0.2)",
  },
  footerText: {
    margin: "10px 0",
    color: "#666",
    fontSize: 14,
  },
};
