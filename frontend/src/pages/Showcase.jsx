export default function Showcase() {
  const vehicles = [
    {
      id: 1,
      name: "KTM RC 390",
      type: "Sportbike",
      image: "🏍️",
      specs: "373cc | 43 HP | 167 kg",
      color: "red"
    },
    {
      id: 2,
      name: "Honda Civic EK9",
      type: "Track Car",
      image: "🚗",
      specs: "1.6L VTEC | 185 HP | 1070 kg",
      color: "black"
    },
    {
      id: 3,
      name: "Nissan GT-R R35",
      type: "Supercar",
      image: "🏎️",
      specs: "3.8L V6 Twin-Turbo | 565 HP",
      color: "blue"
    },
    {
      id: 4,
      name: "Mazda RX-7 FD",
      type: "Sports Car",
      image: "🚘",
      specs: "1.3L Rotary | 280 HP | 1280 kg",
      color: "yellow"
    },
    {
      id: 5,
      name: "BMW M3 E46",
      type: "Performance",
      image: "🚙",
      specs: "3.2L I6 | 343 HP | 1495 kg",
      color: "silver"
    },
    {
      id: 6,
      name: "Toyota Supra A80",
      type: "Legend",
      image: "🏁",
      specs: "3.0L 2JZ-GTE | 320 HP",
      color: "orange"
    }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>NEXAVEN</div>
        <nav style={styles.nav}>
          <a href="/" style={styles.navLink}>Ana Sayfa</a>
          <a href="/showcase" style={styles.navLinkActive}>Araç Vitrini</a>
          <a href="/features" style={styles.navLink}>Özellikler</a>
          <a href="/login" style={styles.navLink}>Giriş</a>
        </nav>
      </header>

      {/* Page Header */}
      <section style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>ARAÇ VİTRİNİ</h1>
        <p style={styles.pageSubtitle}>Modifiyeli Araçlar & Performans Modları</p>
      </section>

      {/* Vehicle Grid */}
      <section style={styles.showcase}>
        <div style={styles.vehicleGrid}>
          {vehicles.map(vehicle => (
            <div key={vehicle.id} style={styles.vehicleCard}>
              <div style={styles.vehicleImage}>{vehicle.image}</div>
              <div style={styles.vehicleInfo}>
                <span style={styles.vehicleType}>{vehicle.type}</span>
                <h3 style={styles.vehicleName}>{vehicle.name}</h3>
                <p style={styles.vehicleSpecs}>{vehicle.specs}</p>
                <button style={styles.vehicleBtn}>Detaylar</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 NEXAVEN - Assetto Corsa Modifiye Araç Vitrini</p>
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
  pageHeader: {
    padding: "80px 60px 40px",
    textAlign: "center",
  },
  pageTitle: {
    fontSize: 56,
    fontWeight: "bold",
    marginBottom: 20,
    letterSpacing: 3,
    color: "#00b7ff",
  },
  pageSubtitle: {
    fontSize: 22,
    color: "#aaa",
  },
  showcase: {
    padding: "40px 60px 80px",
    maxWidth: 1400,
    margin: "0 auto",
  },
  vehicleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 30,
  },
  vehicleCard: {
    background: "rgba(26, 31, 58, 0.6)",
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(0, 183, 255, 0.2)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
  },
  vehicleImage: {
    fontSize: 120,
    textAlign: "center",
    padding: "40px 0",
    background: "linear-gradient(135deg, rgba(0, 183, 255, 0.1), rgba(0, 102, 255, 0.1))",
  },
  vehicleInfo: {
    padding: 30,
  },
  vehicleType: {
    display: "inline-block",
    padding: "6px 14px",
    background: "rgba(0, 183, 255, 0.2)",
    color: "#00b7ff",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 15,
  },
  vehicleName: {
    fontSize: 24,
    marginBottom: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  vehicleSpecs: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 20,
    lineHeight: 1.6,
  },
  vehicleBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #00b7ff, #0066ff)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
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
