import { useEffect, useState } from "react";

export default function Admin() {
  const [licenses, setLicenses] = useState([]);
  const [key, setKey] = useState("");
  const [owner, setOwner] = useState("");
  const [days, setDays] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("/api/license", {
      headers: { Authorization: token }
    })
      .then(r => r.json())
      .then(setLicenses)
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, []);

  const add = async () => {
    await fetch("/api/license", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        license_key: key,
        owner,
        days: days ? Number(days) : null
      })
    });
    
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div style={{ 
      padding: 40, 
      fontFamily: "Arial, sans-serif",
      maxWidth: 1200,
      margin: "0 auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h2>👨‍💼 Admin Panel</h2>
        <button 
          onClick={logout}
          style={{
            padding: "8px 16px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Çıkış Yap
        </button>
      </div>

      <div style={{ 
        background: "#f8f9fa", 
        padding: 20, 
        borderRadius: 8,
        marginBottom: 30 
      }}>
        <h3>➕ Yeni Lisans Oluştur</h3>
        
        <input
          placeholder="Lisans Anahtarı (örn: NXV-AC-2026-001)"
          value={key}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            border: "1px solid #ccc",
            borderRadius: 4
          }}
          onChange={e => setKey(e.target.value)}
        />
        
        <input
          placeholder="Sahip (örn: Flamingo Game Arena)"
          value={owner}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            border: "1px solid #ccc",
            borderRadius: 4
          }}
          onChange={e => setOwner(e.target.value)}
        />
        
        <input
          placeholder="Süre (gün cinsinden, boş bırakın = süresiz)"
          value={days}
          type="number"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            border: "1px solid #ccc",
            borderRadius: 4
          }}
          onChange={e => setDays(e.target.value)}
        />
        
        <button
          onClick={add}
          style={{
            padding: "10px 20px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 16
          }}
        >
          Lisans Oluştur
        </button>
      </div>

      <h3>📋 Mevcut Lisanslar ({licenses.length})</h3>
      
      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse",
        background: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <thead>
          <tr style={{ background: "#007bff", color: "white" }}>
            <th style={{ padding: 12, textAlign: "left" }}>Lisans Anahtarı</th>
            <th style={{ padding: 12, textAlign: "left" }}>Sahip</th>
            <th style={{ padding: 12, textAlign: "left" }}>Durum</th>
            <th style={{ padding: 12, textAlign: "left" }}>HWID</th>
            <th style={{ padding: 12, textAlign: "left" }}>IP</th>
            <th style={{ padding: 12, textAlign: "left" }}>Bitiş Tarihi</th>
          </tr>
        </thead>
        <tbody>
          {licenses.map(l => (
            <tr key={l.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: 12, fontFamily: "monospace" }}>{l.license_key}</td>
              <td style={{ padding: 12 }}>{l.owner}</td>
              <td style={{ padding: 12 }}>
                <span style={{ 
                  padding: "4px 8px",
                  borderRadius: 4,
                  background: l.status === "active" ? "#d4edda" : "#f8d7da",
                  color: l.status === "active" ? "#155724" : "#721c24"
                }}>
                  {l.status}
                </span>
              </td>
              <td style={{ padding: 12, fontFamily: "monospace", fontSize: 12 }}>
                {l.hwid ? l.hwid.substring(0, 20) + "..." : "🔓 Bağlı Değil"}
              </td>
              <td style={{ padding: 12 }}>{l.ip || "-"}</td>
              <td style={{ padding: 12 }}>
                {l.expires_at ? new Date(l.expires_at).toLocaleDateString("tr-TR") : "♾️ Süresiz"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
