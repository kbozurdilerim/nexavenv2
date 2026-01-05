import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [pricing, setPricing] = useState([]);
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    fetch("/api/cms")
      .then(r => r.json())
      .then(data => {
        setPricing(data.pricing || []);
        setDownloads(data.downloads || []);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>NEXAVEN</div>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>Ana Sayfa</Link>
          <Link to="/showcase" style={styles.navLink}>Araç Vitrini</Link>
          <Link to="/features" style={styles.navLink}>Özellikler</Link>
          <Link to="/login" style={styles.navLink}>Giriş</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            YARIŞIN ÖTESİNE GEÇİN
          </h1>
          <p style={styles.heroSubtitle}>
            Nexaven ile Performansı Yükseltin.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/showcase" style={styles.btnPrimary}>Araç Vitrini</Link>
            <Link to="/features" style={styles.btnSecondary}>Özellikleri Keşfet</Link>
          </div>
        </div>
        <div style={styles.heroOverlay}></div>
      </section>

      {/* Features Grid */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>NEXAVEN ASSETTO CORSA PROJESİ</h2>
        
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📊</div>
            <h3 style={styles.featureTitle}>Gelişmiş Sunucu Yönetimi</h3>
            <p style={styles.featureText}>Sunucularınızı tek panelden yönetin</p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⏱️</div>
            <h3 style={styles.featureTitle}>Gerçek Zamanlı İzleme</h3>
            <p style={styles.featureText}>Canlı performans takibi</p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🏆</div>
            <h3 style={styles.featureTitle}>Ligler & Etkinlikler</h3>
            <p style={styles.featureText}>Profesyonel turnuva yönetimi</p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📈</div>
            <h3 style={styles.featureTitle}>İstatistikler & Analizler</h3>
            <p style={styles.featureText}>Detaylı veri analizi</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {pricing.length > 0 && (
        <section style={styles.pricing}>
          <h2 style={styles.sectionTitle}>FİYATLANDIRMA</h2>
          <div style={styles.pricingGrid}>
            {pricing.map(plan => (
              <div key={plan.id} style={styles.pricingCard}>
                <h3 style={styles.pricingName}>{plan.plan_name}</h3>
                <div style={styles.pricingPrice}>{plan.price}₺</div>
                <div style={styles.pricingDuration}>{plan.duration}</div>
                <ul style={styles.pricingFeatures}>
                  {plan.features.split('\n').map((f, i) => (
                    <li key={i} style={styles.pricingFeature}>{f}</li>
                  ))}
                </ul>
                <Link to="/login" style={styles.btnPrimary}>Satın Al</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Downloads Section */}
      {downloads.length > 0 && (
        <section style={styles.downloads}>
          <h2 style={styles.sectionTitle}>İNDİRMELER</h2>
          <div style={styles.downloadsGrid}>
            {downloads.map(download => (
              <div key={download.id} style={styles.downloadCard}>
                <div style={styles.downloadIcon}>📦</div>
                <h3 style={styles.downloadTitle}>{download.title}</h3>
                <div style={styles.downloadMeta}>
                  <span>{download.version}</span> • <span>{download.file_size}</span>
                </div>
                <a href={download.download_url} style={styles.btnSecondary} target="_blank">İndir</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Sadelik ve Performansın Buluştuğu Dijital Platform</h2>
        <p style={styles.ctaText}>Nexaven.com.tr ile yarış tutkunları için güçlü bir platform</p>
        <Link to="/login" style={styles.btnCta}>Kontrol Paneline Git</Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 NEXAVEN - Assetto Corsa Lisans Yönetim Platformu</p>
        <p style={styles.footerText}>nexaven.com.tr - Yarış Tutkunları için Güçlü Bir Platform</p>
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
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 60px",
    background: "rgba(10, 14, 39, 0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(0, 183, 255, 0.2)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
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
  hero: {
    position: "relative",
    height: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"/%3E')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at center, transparent 0%, rgba(10, 14, 39, 0.8) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: 800,
    padding: 40,
  },
  heroTitle: {
    fontSize: 64,
    fontWeight: "bold",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 4,
    background: "linear-gradient(90deg, #00b7ff, #fff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: 28,
    marginBottom: 40,
    color: "#00b7ff",
    fontWeight: 300,
  },
  heroButtons: {
    display: "flex",
    gap: 20,
    justifyContent: "center",
  },
  btnPrimary: {
    padding: "16px 40px",
    background: "linear-gradient(135deg, #00b7ff, #0066ff)",
    color: "#fff",
    textDecoration: "none",
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "bold",
    transition: "transform 0.3s, box-shadow 0.3s",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0, 183, 255, 0.4)",
  },
  btnSecondary: {
    padding: "16px 40px",
    background: "transparent",
    color: "#00b7ff",
    textDecoration: "none",
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "bold",
    border: "2px solid #00b7ff",
    transition: "all 0.3s",
    cursor: "pointer",
  },
  features: {
    padding: "80px 60px",
    maxWidth: 1400,
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: 42,
    textAlign: "center",
    marginBottom: 60,
    letterSpacing: 2,
    color: "#00b7ff",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 30,
  },
  featureCard: {
    background: "rgba(26, 31, 58, 0.6)",
    padding: 40,
    borderRadius: 12,
    border: "1px solid rgba(0, 183, 255, 0.2)",
    transition: "transform 0.3s, border-color 0.3s",
    cursor: "pointer",
    textAlign: "center",
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 22,
    marginBottom: 15,
    color: "#fff",
  },
  featureText: {
    fontSize: 16,
    color: "#aaa",
    lineHeight: 1.6,
  },
  cta: {
    padding: "100px 60px",
    textAlign: "center",
    background: "linear-gradient(135deg, rgba(0, 183, 255, 0.1), rgba(0, 102, 255, 0.1))",
    borderTop: "1px solid rgba(0, 183, 255, 0.2)",
    borderBottom: "1px solid rgba(0, 183, 255, 0.2)",
  },
  pricing: {
    padding: "80px 60px",
    maxWidth: 1400,
    margin: "0 auto",
  },
  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 30,
  },
  pricingCard: {
    background: "rgba(26, 31, 58, 0.6)",
    padding: 40,
    borderRadius: 16,
    border: "1px solid rgba(0, 183, 255, 0.2)",
    textAlign: "center",
  },
  pricingName: {
    fontSize: 28,
    marginBottom: 20,
    color: "#00b7ff",
  },
  pricingPrice: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  pricingDuration: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 30,
  },
  pricingFeatures: {
    listStyle: "none",
    padding: 0,
    marginBottom: 30,
  },
  pricingFeature: {
    padding: "10px 0",
    color: "#ddd",
    borderBottom: "1px solid rgba(0, 183, 255, 0.1)",
  },
  downloads: {
    padding: "80px 60px",
    maxWidth: 1400,
    margin: "0 auto",
    background: "rgba(10, 14, 39, 0.3)",
  },
  downloadsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 30,
  },
  downloadCard: {
    background: "rgba(26, 31, 58, 0.6)",
    padding: 40,
    borderRadius: 12,
    border: "1px solid rgba(0, 183, 255, 0.2)",
    textAlign: "center",
  },
  downloadIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  downloadTitle: {
    fontSize: 22,
    marginBottom: 15,
    color: "#fff",
  },
  downloadMeta: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 25,
  },
  ctaTitle: {
    fontSize: 38,
    marginBottom: 20,
    color: "#fff",
  },
  ctaText: {
    fontSize: 20,
    marginBottom: 40,
    color: "#aaa",
  },
  btnCta: {
    display: "inline-block",
    padding: "18px 50px",
    background: "linear-gradient(135deg, #00b7ff, #0066ff)",
    color: "#fff",
    textDecoration: "none",
    borderRadius: 8,
    fontSize: 20,
    fontWeight: "bold",
    transition: "transform 0.3s",
    boxShadow: "0 6px 30px rgba(0, 183, 255, 0.5)",
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
