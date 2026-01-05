export default function Home() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif", maxWidth: 800, margin: "0 auto" }}>
      <h1>🏎️ NEXAVEN</h1>
      <p style={{ fontSize: 18, color: "#666" }}>
        Assetto Corsa & Lisans Yönetim Platformu
      </p>
      
      <div style={{ marginTop: 40 }}>
        <h3>✨ Özellikler</h3>
        <ul style={{ lineHeight: 1.8 }}>
          <li>🔐 HWID bazlı lisans kilitleme</li>
          <li>⏰ Süreli lisans desteği</li>
          <li>👨‍💼 Admin panel</li>
          <li>🎮 Assetto Corsa entegrasyonu</li>
          <li>🔒 HTTPS & SSL desteği</li>
        </ul>
      </div>

      <div style={{ marginTop: 40 }}>
        <a 
          href="/login" 
          style={{
            padding: "12px 24px",
            background: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: 4,
            display: "inline-block"
          }}
        >
          Admin Girişi
        </a>
      </div>
    </div>
  );
}
