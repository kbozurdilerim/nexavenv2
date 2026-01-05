export default function Features() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>NEXAVEN</div>
        <nav style={styles.nav}>
          <a href="/" style={styles.navLink}>Ana Sayfa</a>
          <a href="/showcase" style={styles.navLink}>Araç Vitrini</a>
          <a href="/features" style={styles.navLinkActive}>Özellikler</a>
          <a href="/login" style={styles.navLink}>Giriş</a>
        </nav>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>NEXAVEN ÖZELLİKLERİ</h1>
        <p style={styles.heroSubtitle}>Sadelik ve Performansın Buluştuğu Dijital Platform</p>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <div style={styles.featureRow}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🎮</div>
            <h3 style={styles.featureTitle}>Kontrol Paneli</h3>
            <p style={styles.featureText}>
              Sunucu performansını izleyin, aktif kullanıcıları görün ve gerçek zamanlı
              sunucu istatistiklerine erişin.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🖥️</div>
            <h3 style={styles.featureTitle}>Sunucu Listesi</h3>
            <p style={styles.featureText}>
              GTS Sprint Server, Drift Arena, Elit Arena gibi sunucularınızı
              kolayca yönetin ve katılım bilgilerini takip edin.
            </p>
          </div>
        </div>

        <div style={styles.featureRow}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🏆</div>
            <h3 style={styles.featureTitle}>Lig & Etkinlikler</h3>
            <p style={styles.featureText}>
              Profesyonel turnuvalar oluşturun, lig sıralamasını görüntüleyin
              ve etkinlik takviminizi yönetin.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📊</div>
            <h3 style={styles.featureTitle}>İstatistikler</h3>
            <p style={styles.featureText}>
              Detaylı kişisel istatistikler, en hızlı turlar, kazanılan yarışlar
              ve performans grafikleri.
            </p>
          </div>
        </div>

        <div style={styles.featureRow}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔐</div>
            <h3 style={styles.featureTitle}>Lisans Yönetimi</h3>
            <p style={styles.featureText}>
              HWID bazlı lisans kilitleme, süreli lisans desteği ve
              gelişmiş güvenlik özellikleri.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Gerçek Zamanlı İzleme</h3>
            <p style={styles.featureText}>
              CPU, RAM kullanımı, aktif oyuncular ve sunucu durumu
              anlık olarak takip edin.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Nexaven.com.tr Örnek Sayfalar</h2>
        <p style={styles.ctaText}>
          Kontrol Paneli • Sunucu Listesi • Lig & Etkinlikler • İstatistikler
        </p>
        <a href="/login" style={styles.ctaBtn}>Şimdi Başlayın</a>
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
