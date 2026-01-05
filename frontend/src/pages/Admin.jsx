import { useEffect, useState } from "react";

// Global tablo stilleri
const injectTableStyles = () => {
  if (!document.getElementById("admin-table-styles")) {
    const style = document.createElement("style");
    style.id = "admin-table-styles";
    style.innerHTML = `
      table th {
        background: rgba(0, 183, 255, 0.15);
        color: #00b7ff;
        padding: 15px;
        text-align: left;
        font-weight: bold;
        border-bottom: 2px solid rgba(0, 183, 255, 0.3);
      }
      table td {
        padding: 15px;
        color: #ddd;
        border-bottom: 1px solid rgba(0, 183, 255, 0.1);
      }
      table tr:hover td {
        background: rgba(0, 183, 255, 0.05);
      }
    `;
    document.head.appendChild(style);
  }
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState("licenses");
  const [licenses, setLicenses] = useState([]);
  const [features, setFeatures] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [downloads, setDownloads] = useState([]);
  
  const [key, setKey] = useState("");
  const [owner, setOwner] = useState("");
  const [days, setDays] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    injectTableStyles();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Lisansları getir
    fetch("/api/license", {
      headers: { Authorization: token }
    })
      .then(r => r.json())
      .then(setLicenses)
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });

    // CMS içeriklerini getir
    fetch("/api/cms")
      .then(r => r.json())
      .then(data => {
        setFeatures(data.features || []);
        setVehicles(data.vehicles || []);
        setPricing(data.pricing || []);
        setDownloads(data.downloads || []);
      });
  }, []);

  const addLicense = async () => {
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
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>NEXAVEN ADMIN</div>
        <nav style={styles.nav}>
          <button onClick={() => setActiveTab("licenses")} style={activeTab === "licenses" ? styles.navBtnActive : styles.navBtn}>
            🔐 Lisanslar
          </button>
          <button onClick={() => setActiveTab("features")} style={activeTab === "features" ? styles.navBtnActive : styles.navBtn}>
            ⭐ Özellikler
          </button>
          <button onClick={() => setActiveTab("vehicles")} style={activeTab === "vehicles" ? styles.navBtnActive : styles.navBtn}>
            🚗 Araç Vitrini
          </button>
          <button onClick={() => setActiveTab("pricing")} style={activeTab === "pricing" ? styles.navBtnActive : styles.navBtn}>
            💰 Ücretler
          </button>
          <button onClick={() => setActiveTab("downloads")} style={activeTab === "downloads" ? styles.navBtnActive : styles.navBtn}>
            📥 İndirmeler
          </button>
        </nav>
        <button onClick={logout} style={styles.logoutBtn}>Çıkış Yap</button>
      </div>

      <div style={styles.content}>
        {activeTab === "licenses" && <LicensesTab licenses={licenses} addLicense={addLicense} {...{key, setKey, owner, setOwner, days, setDays}} />}
        {activeTab === "features" && <FeaturesTab features={features} token={token} />}
        {activeTab === "vehicles" && <VehiclesTab vehicles={vehicles} token={token} />}
        {activeTab === "pricing" && <PricingTab pricing={pricing} token={token} />}
        {activeTab === "downloads" && <DownloadsTab downloads={downloads} token={token} />}
      </div>
    </div>
  );
}

function LicensesTab({ licenses, addLicense, key, setKey, owner, setOwner, days, setDays }) {
  return (
    <div>
      <h2 style={styles.title}>Lisans Yönetimi</h2>
      
      <div style={styles.card}>
        <h3>➕ Yeni Lisans Oluştur</h3>
        <input placeholder="Lisans Anahtarı" value={key} style={styles.input} onChange={e => setKey(e.target.value)} />
        <input placeholder="Sahip" value={owner} style={styles.input} onChange={e => setOwner(e.target.value)} />
        <input placeholder="Süre (gün)" value={days} type="number" style={styles.input} onChange={e => setDays(e.target.value)} />
        <button onClick={addLicense} style={styles.btnPrimary}>Lisans Oluştur</button>
      </div>

      <h3 style={styles.subtitle}>📋 Mevcut Lisanslar ({licenses.length})</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Lisans</th><th>Sahip</th><th>Durum</th><th>HWID</th><th>IP</th><th>Bitiş</th>
          </tr>
        </thead>
        <tbody>
          {licenses.map(l => (
            <tr key={l.id}>
              <td>{l.license_key}</td>
              <td>{l.owner}</td>
              <td><span style={l.status === "active" ? styles.badgeActive : styles.badgeInactive}>{l.status}</span></td>
              <td>{l.hwid ? l.hwid.substring(0, 20) + "..." : "🔓"}</td>
              <td>{l.ip || "-"}</td>
              <td>{l.expires_at ? new Date(l.expires_at).toLocaleDateString("tr-TR") : "♾️"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeaturesTab({ features, token }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  const add = async () => {
    await fetch("/api/cms/features", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ title, description, icon, order_index: features.length })
    });
    window.location.reload();
  };

  const remove = async (id) => {
    await fetch(`/api/cms/features/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    window.location.reload();
  };

  return (
    <div>
      <h2 style={styles.title}>Özellikler Yönetimi</h2>
      
      <div style={styles.card}>
        <h3>➕ Yeni Özellik Ekle</h3>
        <input placeholder="Başlık" value={title} style={styles.input} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Açıklama" value={description} style={styles.textarea} onChange={e => setDescription(e.target.value)} />
        <input placeholder="Icon (emoji)" value={icon} style={styles.input} onChange={e => setIcon(e.target.value)} />
        <button onClick={add} style={styles.btnPrimary}>Ekle</button>
      </div>

      <div style={styles.grid}>
        {features.map(f => (
          <div key={f.id} style={styles.gridCard}>
            <div style={{fontSize: 40}}>{f.icon}</div>
            <h4>{f.title}</h4>
            <p style={{fontSize: 14, color: "#aaa"}}>{f.description}</p>
            <button onClick={() => remove(f.id)} style={styles.btnDanger}>Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function VehiclesTab({ vehicles, token }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [specs, setSpecs] = useState("");
  const [image, setImage] = useState("🚗");

  const add = async () => {
    await fetch("/api/cms/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ name, type, specs, image, order_index: vehicles.length })
    });
    window.location.reload();
  };

  const remove = async (id) => {
    await fetch(`/api/cms/vehicles/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    window.location.reload();
  };

  return (
    <div>
      <h2 style={styles.title}>Araç Vitrini Yönetimi</h2>
      
      <div style={styles.card}>
        <h3>➕ Yeni Araç Ekle</h3>
        <input placeholder="Araç Adı" value={name} style={styles.input} onChange={e => setName(e.target.value)} />
        <input placeholder="Tip (örn: Sportbike)" value={type} style={styles.input} onChange={e => setType(e.target.value)} />
        <input placeholder="Özellikler" value={specs} style={styles.input} onChange={e => setSpecs(e.target.value)} />
        <input placeholder="Emoji (🏍️)" value={image} style={styles.input} onChange={e => setImage(e.target.value)} />
        <button onClick={add} style={styles.btnPrimary}>Ekle</button>
      </div>

      <div style={styles.grid}>
        {vehicles.map(v => (
          <div key={v.id} style={styles.gridCard}>
            <div style={{fontSize: 60}}>{v.image}</div>
            <span style={styles.badge}>{v.type}</span>
            <h4>{v.name}</h4>
            <p style={{fontSize: 14, color: "#aaa"}}>{v.specs}</p>
            <button onClick={() => remove(v.id)} style={styles.btnDanger}>Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingTab({ pricing, token }) {
  const [planName, setPlanName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [featuresList, setFeaturesList] = useState("");

  const add = async () => {
    await fetch("/api/cms/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ 
        plan_name: planName, 
        price, 
        duration, 
        features: featuresList, 
        order_index: pricing.length 
      })
    });
    window.location.reload();
  };

  const remove = async (id) => {
    await fetch(`/api/cms/pricing/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    window.location.reload();
  };

  return (
    <div>
      <h2 style={styles.title}>Ücret Planları Yönetimi</h2>
      
      <div style={styles.card}>
        <h3>➕ Yeni Plan Ekle</h3>
        <input placeholder="Plan Adı" value={planName} style={styles.input} onChange={e => setPlanName(e.target.value)} />
        <input placeholder="Fiyat (₺500)" value={price} style={styles.input} onChange={e => setPrice(e.target.value)} />
        <input placeholder="Süre (Aylık)" value={duration} style={styles.input} onChange={e => setDuration(e.target.value)} />
        <textarea placeholder="Özellikler (her satırda bir)" value={featuresList} style={styles.textarea} onChange={e => setFeaturesList(e.target.value)} />
        <button onClick={add} style={styles.btnPrimary}>Ekle</button>
      </div>

      <div style={styles.grid}>
        {pricing.map(p => (
          <div key={p.id} style={styles.gridCard}>
            <h3>{p.plan_name}</h3>
            <div style={{fontSize: 32, color: "#00b7ff", margin: "15px 0"}}>{p.price}</div>
            <p style={{color: "#aaa", marginBottom: 15}}>{p.duration}</p>
            <div style={{fontSize: 12, color: "#666", whiteSpace: "pre-line"}}>{p.features}</div>
            <button onClick={() => remove(p.id)} style={styles.btnDanger}>Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DownloadsTab({ downloads, token }) {
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileSize, setFileSize] = useState("");

  const add = async () => {
    await fetch("/api/cms/downloads", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ 
        title, 
        version, 
        download_url: downloadUrl, 
        file_size: fileSize, 
        order_index: downloads.length 
      })
    });
    window.location.reload();
  };

  const remove = async (id) => {
    await fetch(`/api/cms/downloads/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    window.location.reload();
  };

  return (
    <div>
      <h2 style={styles.title}>İndirmeler Yönetimi</h2>
      
      <div style={styles.card}>
        <h3>➕ Yeni İndirme Ekle</h3>
        <input placeholder="Başlık" value={title} style={styles.input} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Versiyon (v1.0.0)" value={version} style={styles.input} onChange={e => setVersion(e.target.value)} />
        <input placeholder="İndirme Linki" value={downloadUrl} style={styles.input} onChange={e => setDownloadUrl(e.target.value)} />
        <input placeholder="Dosya Boyutu (250 MB)" value={fileSize} style={styles.input} onChange={e => setFileSize(e.target.value)} />
        <button onClick={add} style={styles.btnPrimary}>Ekle</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr><th>Başlık</th><th>Versiyon</th><th>Boyut</th><th>Link</th><th>İşlem</th></tr>
        </thead>
        <tbody>
          {downloads.map(d => (
            <tr key={d.id}>
              <td>{d.title}</td>
              <td>{d.version}</td>
              <td>{d.file_size}</td>
              <td><a href={d.download_url} target="_blank" style={{color: "#00b7ff"}}>İndir</a></td>
              <td><button onClick={() => remove(d.id)} style={styles.btnDanger}>Sil</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  sidebar: {
    width: 260,
    background: "rgba(10, 14, 39, 0.95)",
    borderRight: "1px solid rgba(0, 183, 255, 0.2)",
    padding: 30,
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00b7ff",
    marginBottom: 40,
    letterSpacing: 2,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },
  navBtn: {
    padding: "12px 16px",
    background: "transparent",
    color: "#aaa",
    border: "none",
    borderRadius: 8,
    textAlign: "left",
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.3s",
  },
  navBtnActive: {
    padding: "12px 16px",
    background: "rgba(0, 183, 255, 0.2)",
    color: "#00b7ff",
    border: "none",
    borderRadius: 8,
    textAlign: "left",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutBtn: {
    padding: "12px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 40,
    overflowY: "auto",
  },
  title: {
    fontSize: 32,
    color: "#00b7ff",
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 22,
    color: "#fff",
    marginTop: 40,
    marginBottom: 20,
  },
  card: {
    background: "rgba(26, 31, 58, 0.6)",
    padding: 30,
    borderRadius: 12,
    border: "1px solid rgba(0, 183, 255, 0.2)",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 15,
    background: "rgba(10, 14, 39, 0.6)",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    padding: 12,
    marginBottom: 15,
    background: "rgba(10, 14, 39, 0.6)",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    minHeight: 100,
    fontFamily: "inherit",
  },
  btnPrimary: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #00b7ff, #0066ff)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "bold",
  },
  btnDanger: {
    padding: "8px 16px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    background: "rgba(26, 31, 58, 0.6)",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid rgba(0, 183, 255, 0.2)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
    marginTop: 20,
  },
  gridCard: {
    background: "rgba(26, 31, 58, 0.6)",
    padding: 25,
    borderRadius: 12,
    border: "1px solid rgba(0, 183, 255, 0.2)",
    textAlign: "center",
  },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    background: "rgba(0, 183, 255, 0.2)",
    color: "#00b7ff",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  badgeActive: {
    padding: "4px 12px",
    background: "#d4edda",
    color: "#155724",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: "bold",
  },
  badgeInactive: {
    padding: "4px 12px",
    background: "#f8d7da",
    color: "#721c24",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: "bold",
  },
};
