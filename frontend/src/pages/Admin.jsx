import { useEffect, useState } from "react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [licenses, setLicenses] = useState([]);
  const [features, setFeatures] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [licenseRequests, setLicenseRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [siteSettings, setSiteSettings] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Dashboard stats
      const statsRes = await fetch("/api/dashboard/stats", {
        headers: { Authorization: token }
      });
      setStats(await statsRes.json());

      // Licenses
      const licRes = await fetch("/api/license", {
        headers: { Authorization: token }
      });
      setLicenses(await licRes.json());

      // CMS
      const cmsRes = await fetch("/api/cms");
      const cmsData = await cmsRes.json();
      setFeatures(cmsData.features || []);
      setVehicles(cmsData.vehicles || []);
      setPricing(cmsData.pricing || []);
      setDownloads(cmsData.downloads || []);

      // License Requests
      const reqRes = await fetch("/api/license-requests/all", {
        headers: { Authorization: token }
      });
      setLicenseRequests(await reqRes.json());

      // Site Settings
      const settingsRes = await fetch("/api/settings", {
        headers: { Authorization: token }
      });
      setSiteSettings(await settingsRes.json());
    } catch (err) {
      console.error("Veri yüklenirken hata:", err);
    }
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
          <button onClick={() => setActiveTab("dashboard")} style={activeTab === "dashboard" ? styles.navBtnActive : styles.navBtn}>
            📊 Dashboard
          </button>
          <button onClick={() => setActiveTab("requests")} style={activeTab === "requests" ? styles.navBtnActive : styles.navBtn}>
            🎫 Lisans Talepleri
          </button>
          <button onClick={() => setActiveTab("licenses")} style={activeTab === "licenses" ? styles.navBtnActive : styles.navBtn}>
            🔐 Lisanslar
          </button>
          <button onClick={() => setActiveTab("features")} style={activeTab === "features" ? styles.navBtnActive : styles.navBtn}>
            ⭐ Özellikler
          </button>
          <button onClick={() => setActiveTab("vehicles")} style={activeTab === "vehicles" ? styles.navBtnActive : styles.navBtn}>
            🚗 Araç Vitrini
          </button>
          <button onClick={() => setActiveTab("settings")} style={activeTab === "settings" ? styles.navBtnActive : styles.navBtn}>
            ⚙️ Genel Ayarlar
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
        {activeTab === "dashboard" && <DashboardTab stats={stats} />}
        {activeTab === "requests" && <RequestsTab requests={licenseRequests} token={token} onUpdate={fetchData} />}
        {activeTab === "licenses" && <LicensesTab licenses={licenses} token={token} onUpdate={fetchData} />}
        {activeTab === "features" && <FeaturesTab features={features} token={token} onUpdate={fetchData} />}
        {activeTab === "settings" && <SettingsTab settings={siteSettings} token={token} onUpdate={fetchData} />}
        {activeTab === "vehicles" && <VehiclesTab vehicles={vehicles} token={token} onUpdate={fetchData} />}
        {activeTab === "pricing" && <PricingTab pricing={pricing} token={token} onUpdate={fetchData} />}
        {activeTab === "downloads" && <DownloadsTab downloads={downloads} token={token} onUpdate={fetchData} />}
      </div>
    </div>
  );
}

// Dashboard Tab
function DashboardTab({ stats }) {
  return (
    <div>
      <h2 style={styles.title}>📊 Dashboard</h2>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statNumber}>{stats.total_users || 0}</div>
          <div style={styles.statLabel}>Toplam Kullanıcı</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎫</div>
          <div style={styles.statNumber}>{stats.active_licenses || 0}</div>
          <div style={styles.statLabel}>Aktif Lisans</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statNumber}>{stats.pending_requests || 0}</div>
          <div style={styles.statLabel}>Bekleyen Talep</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statNumber}>{stats.total_revenue || 0} ₺</div>
          <div style={styles.statLabel}>Toplam Gelir</div>
        </div>
      </div>
    </div>
  );
}

// License Requests Tab
function RequestsTab({ requests, token, onUpdate }) {
  const [adminNote, setAdminNote] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const approveRequest = async (id) => {
    const note = prompt("Admin Notu (isteğe bağlı):");
    try {
      await fetch(`/api/license-requests/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({ admin_note: note })
      });
      alert("✅ Talep onaylandı!");
      onUpdate();
    } catch (err) {
      alert("❌ Hata oluştu!");
    }
  };

  const rejectRequest = async (id) => {
    const note = prompt("Red Nedeni:");
    if (!note) return;
    try {
      await fetch(`/api/license-requests/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({ admin_note: note })
      });
      alert("✅ Talep reddedildi!");
      onUpdate();
    } catch (err) {
      alert("❌ Hata oluştu!");
    }
  };

  return (
    <div>
      <h2 style={styles.title}>🎫 Lisans Talepleri</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Kullanıcı</th>
            <th>Plan</th>
            <th>Durum</th>
            <th>Tarih</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.username || `User #${req.user_id}`}</td>
              <td>{req.plan_name}</td>
              <td>
                <span style={
                  req.status === "approved" ? styles.badgeActive :
                  req.status === "rejected" ? styles.badgeInactive :
                  styles.badgePending
                }>
                  {req.status}
                </span>
              </td>
              <td>{new Date(req.created_at).toLocaleString("tr-TR")}</td>
              <td>
                {req.status === "pending" && (
                  <>
                    <button onClick={() => approveRequest(req.id)} style={styles.btnSuccess}>✅ Onayla</button>
                    {" "}
                    <button onClick={() => rejectRequest(req.id)} style={styles.btnDanger}>❌ Reddet</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Licenses Tab
function LicensesTab({ licenses, token, onUpdate }) {
  const [key, setKey] = useState("");
  const [owner, setOwner] = useState("");
  const [days, setDays] = useState("");

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
    onUpdate();
    setKey("");
    setOwner("");
    setDays("");
  };

  return (
    <div>
      <h2 style={styles.title}>🔐 Lisans Yönetimi</h2>
      
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

// Features Tab with Image Upload
function FeaturesTab({ features, token, onUpdate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadImage = async () => {
    if (!imageFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    
    try {
      const res = await fetch("/api/cms/upload", {
        method: "POST",
        headers: { Authorization: token },
        body: formData
      });
      const data = await res.json();
      setImageUrl(data.imageUrl);
      alert("✅ Resim yüklendi!");
    } catch (err) {
      alert("❌ Resim yüklenemedi!");
    } finally {
      setUploading(false);
    }
  };

  const add = async () => {
    if (!title || !description) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }
    
    await fetch("/api/cms/features", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ title, description, icon, image_url: imageUrl, order_index: features.length })
    });
    onUpdate();
    setTitle("");
    setDescription("");
    setIcon("");
    setImageUrl("");
    setImageFile(null);
  };

  const remove = async (id) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/cms/features/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    onUpdate();
  };

  return (
    <div>
      <h2 style={styles.title}>⭐ Özellikler Yönetimi</h2>
      
      <div style={styles.card}>
        <h3>➕ Yeni Özellik Ekle</h3>
        <input placeholder="Başlık" value={title} style={styles.input} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Açıklama" value={description} style={styles.textarea} onChange={e => setDescription(e.target.value)} />
        <input placeholder="Icon (emoji)" value={icon} style={styles.input} onChange={e => setIcon(e.target.value)} />
        
        <div style={styles.uploadSection}>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={styles.fileInput} />
          <button onClick={uploadImage} style={styles.btnSecondary} disabled={uploading || !imageFile}>
            {uploading ? "⏳ Yükleniyor..." : "📸 Resim Yükle"}
          </button>
          {imageUrl && <span style={styles.uploadSuccess}>✅ Yüklendi: {imageUrl}</span>}
        </div>
        
        <button onClick={add} style={styles.btnPrimary}>Ekle</button>
      </div>

      <div style={styles.grid}>
        {features.map(f => (
          <div key={f.id} style={styles.gridCard}>
            {f.image_url ? (
              <img src={f.image_url} alt={f.title} style={{width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 10}} />
            ) : (
              <div style={{fontSize: 40}}>{f.icon || "⭐"}</div>
            )}
            <h4>{f.title}</h4>
            <p style={{fontSize: 14, color: "#aaa"}}>{f.description}</p>
            <button onClick={() => remove(f.id)} style={styles.btnDanger}>Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Vehicles Tab with Image Upload
function VehiclesTab({ vehicles, token, onUpdate }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [specs, setSpecs] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadImage = async () => {
    if (!imageFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    
    try {
      const res = await fetch("/api/cms/upload", {
        method: "POST",
        headers: { Authorization: token },
        body: formData
      });
      const data = await res.json();
      setImageUrl(data.imageUrl);
      alert("✅ Resim yüklendi!");
    } catch (err) {
      alert("❌ Resim yüklenemedi!");
    } finally {
      setUploading(false);
    }
  };

  const add = async () => {
    if (!name || !type) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }
    
    await fetch("/api/cms/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ name, type, specs, image: imageUrl || "🚗", order_index: vehicles.length })
    });
    onUpdate();
    setName("");
    setType("");
    setSpecs("");
    setImageUrl("");
    setImageFile(null);
  };

  const remove = async (id) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/cms/vehicles/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    onUpdate();
  };

  return (
    <div>
      <h2 style={styles.title}>🚗 Araç Vitrini Yönetimi</h2>
      
      <div style={styles.card}>
        <h3>➕ Yeni Araç Ekle</h3>
        <input placeholder="Araç Adı" value={name} style={styles.input} onChange={e => setName(e.target.value)} />
        <input placeholder="Tip (örn: Sportbike)" value={type} style={styles.input} onChange={e => setType(e.target.value)} />
        <input placeholder="Özellikler" value={specs} style={styles.input} onChange={e => setSpecs(e.target.value)} />
        
        <div style={styles.uploadSection}>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={styles.fileInput} />
          <button onClick={uploadImage} style={styles.btnSecondary} disabled={uploading || !imageFile}>
            {uploading ? "⏳ Yükleniyor..." : "📸 Resim Yükle"}
          </button>
          {imageUrl && <span style={styles.uploadSuccess}>✅ Yüklendi: {imageUrl}</span>}
        </div>
        
        <button onClick={add} style={styles.btnPrimary}>Ekle</button>
      </div>

      <div style={styles.grid}>
        {vehicles.map(v => (
          <div key={v.id} style={styles.gridCard}>
            {v.image && v.image.startsWith("/uploads") ? (
              <img src={v.image} alt={v.name} style={{width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 10}} />
            ) : (
              <div style={{fontSize: 40}}>{v.image || "🚗"}</div>
            )}
            <h4>{v.name}</h4>
            <p style={{fontSize: 14, color: "#00b7ff"}}>{v.type}</p>
            <p style={{fontSize: 12, color: "#aaa"}}>{v.specs}</p>
            <button onClick={() => remove(v.id)} style={styles.btnDanger}>Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pricing Tab
function PricingTab({ pricing, token, onUpdate }) {
  const [plan, setPlan] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState("");

  const add = async () => {
    if (!plan || !price) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }
    
    await fetch("/api/cms/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ plan_name: plan, price, features, order_index: pricing.length })
    });
    onUpdate();
    setPlan("");
    setPrice("");
    setFeatures("");
  };

  const remove = async (id) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/cms/pricing/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    onUpdate();
  };

  return (
    <div>
      <h2 style={styles.title}>💰 Ücretlendirme Yönetimi</h2>
      
      <div style={styles.card}>
        <h3>➕ Yeni Plan Ekle</h3>
        <input placeholder="Plan Adı" value={plan} style={styles.input} onChange={e => setPlan(e.target.value)} />
        <input placeholder="Fiyat (₺)" value={price} style={styles.input} onChange={e => setPrice(e.target.value)} />
        <textarea placeholder="Özellikler (her satır bir özellik)" value={features} style={styles.textarea} onChange={e => setFeatures(e.target.value)} />
        <button onClick={add} style={styles.btnPrimary}>Ekle</button>
      </div>

      <div style={styles.grid}>
        {pricing.map(p => (
          <div key={p.id} style={styles.gridCard}>
            <h4>{p.plan_name}</h4>
            <div style={{fontSize: 32, color: "#00b7ff", margin: "15px 0"}}>{p.price} ₺</div>
            <p style={{fontSize: 14, color: "#aaa", whiteSpace: "pre-line"}}>{p.features}</p>
            <button onClick={() => remove(p.id)} style={styles.btnDanger}>Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Downloads Tab
function DownloadsTab({ downloads, token, onUpdate }) {
  const [version, setVersion] = useState("");
  const [url, setUrl] = useState("");
  const [changelog, setChangelog] = useState("");

  const add = async () => {
    if (!version || !url) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }
    
    await fetch("/api/cms/downloads", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ version, download_url: url, changelog, order_index: downloads.length })
    });
    onUpdate();
    setVersion("");
    setUrl("");
    setChangelog("");
  };

  const remove = async (id) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/cms/downloads/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    onUpdate();
  };

  return (
    <div>
      <h2 style={styles.title}>📥 İndirme Yönetimi</h2>
      
      <div style={styles.card}>
        <h3>➕ Yeni Versiyon Ekle</h3>
        <input placeholder="Versiyon (örn: v1.0.0)" value={version} style={styles.input} onChange={e => setVersion(e.target.value)} />
        <input placeholder="İndirme Linki" value={url} style={styles.input} onChange={e => setUrl(e.target.value)} />
        <textarea placeholder="Değişiklikler" value={changelog} style={styles.textarea} onChange={e => setChangelog(e.target.value)} />
        <button onClick={add} style={styles.btnPrimary}>Ekle</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Versiyon</th>
            <th>İndirme Linki</th>
            <th>Değişiklikler</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {downloads.map(d => (
            <tr key={d.id}>
              <td><strong>{d.version}</strong></td>
              <td><a href={d.download_url} target="_blank" style={{color: "#00b7ff"}}>İndir</a></td>
              <td style={{fontSize: 12}}>{d.changelog}</td>
              <td>
                <button onClick={() => remove(d.id)} style={styles.btnDanger}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#0a0e27",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  sidebar: {
    width: 280,
    background: "rgba(26, 31, 58, 0.95)",
    borderRight: "1px solid rgba(0, 183, 255, 0.3)",
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    padding: "30px 20px",
    fontSize: 22,
    fontWeight: "bold",
    background: "linear-gradient(90deg, #00b7ff, #0066ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textAlign: "center",
    letterSpacing: 2,
  },
  nav: {
    flex: 1,
    padding: "20px 15px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  navBtn: {
    padding: "15px 20px",
    background: "transparent",
    color: "#aaa",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    textAlign: "left",
    transition: "all 0.3s",
  },
  navBtnActive: {
    padding: "15px 20px",
    background: "linear-gradient(135deg, #00b7ff, #0066ff)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    textAlign: "left",
    fontWeight: "bold",
  },
  logoutBtn: {
    margin: "20px 15px",
    padding: "12px",
    background: "rgba(220, 53, 69, 0.2)",
    color: "#ff6b6b",
    border: "1px solid #dc3545",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
  },
  content: {
    flex: 1,
    padding: 40,
    overflowY: "auto",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    marginBottom: 30,
  },
  subtitle: {
    color: "#00b7ff",
    fontSize: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  card: {
    background: "rgba(26, 31, 58, 0.9)",
    padding: 30,
    borderRadius: 12,
    border: "1px solid rgba(0, 183, 255, 0.3)",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: "14px 18px",
    background: "rgba(10, 14, 39, 0.6)",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    marginBottom: 15,
  },
  textarea: {
    width: "100%",
    padding: "14px 18px",
    background: "rgba(10, 14, 39, 0.6)",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    marginBottom: 15,
    minHeight: 100,
    fontFamily: "inherit",
  },
  uploadSection: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    marginBottom: 15,
    flexWrap: "wrap",
  },
  fileInput: {
    flex: 1,
    padding: "10px",
    background: "rgba(10, 14, 39, 0.6)",
    border: "1px solid rgba(0, 183, 255, 0.3)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
  },
  uploadSuccess: {
    color: "#28a745",
    fontSize: 14,
  },
  btnPrimary: {
    padding: "14px 30px",
    background: "linear-gradient(135deg, #00b7ff, #0066ff)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: "bold",
  },
  btnSecondary: {
    padding: "10px 20px",
    background: "rgba(0, 183, 255, 0.2)",
    color: "#00b7ff",
    border: "1px solid rgba(0, 183, 255, 0.4)",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  btnSuccess: {
    padding: "8px 16px",
    background: "rgba(40, 167, 69, 0.2)",
    color: "#28a745",
    border: "1px solid #28a745",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
  btnDanger: {
    padding: "8px 16px",
    background: "rgba(220, 53, 69, 0.2)",
    color: "#dc3545",
    border: "1px solid #dc3545",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 20,
    marginBottom: 40,
  },
  statCard: {
    background: "rgba(26, 31, 58, 0.9)",
    padding: 30,
    borderRadius: 12,
    border: "1px solid rgba(0, 183, 255, 0.3)",
    textAlign: "center",
  },
  statIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#00b7ff",
    marginBottom: 5,
  },
  statLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "rgba(26, 31, 58, 0.6)",
    borderRadius: 12,
    overflow: "hidden",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
  },
  gridCard: {
    background: "rgba(26, 31, 58, 0.9)",
    padding: 25,
    borderRadius: 12,
    border: "1px solid rgba(0, 183, 255, 0.3)",
    textAlign: "center",
  },
  badgeActive: {
    padding: "6px 12px",
    background: "rgba(40, 167, 69, 0.2)",
    color: "#28a745",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "bold",
  },
  badgeInactive: {
    padding: "6px 12px",
    background: "rgba(220, 53, 69, 0.2)",
    color: "#dc3545",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "bold",
  },
  badgePending: {
    padding: "6px 12px",
    background: "rgba(255, 193, 7, 0.2)",
    color: "#ffc107",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "bold",
  },
};

// ============ Settings Tab ============
function SettingsTab({ settings, token, onUpdate }) {
  const [formData, setFormData] = useState({
    site_title: "",
    site_description: "",
    hero_title: "",
    hero_subtitle: "",
    about_title: "",
    about_text: "",
    contact_email: "",
    contact_phone: "",
    social_facebook: "",
    social_twitter: "",
    social_instagram: "",
    footer_text: "",
    ...settings
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({ ...formData, ...settings });
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Ayarlar başarıyla kaydedildi!");
        onUpdate();
      } else {
        alert("Kaydetme hatası!");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucuya bağlanılamadı!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={styles.title}>⚙️ Genel Site Ayarları</h2>
      <p style={{ color: "#aaa", marginBottom: 30 }}>
        Ana sayfanın tüm içeriğini buradan düzenleyebilirsiniz. Değişiklikler anında yansır.
      </p>

      <div style={{ display: "grid", gap: 25, maxWidth: 900 }}>
        {/* Site Info */}
        <div style={styles.card}>
          <h3 style={{ color: "#00b7ff", marginBottom: 15 }}>🌐 Site Bilgileri</h3>
          <label style={styles.label}>Site Başlığı</label>
          <input
            style={styles.input}
            value={formData.site_title}
            onChange={(e) => handleChange("site_title", e.target.value)}
            placeholder="Nexaven - Profesyonel ECU Chip Tuning"
          />
          <label style={styles.label}>Site Açıklaması (Meta)</label>
          <input
            style={styles.input}
            value={formData.site_description}
            onChange={(e) => handleChange("site_description", e.target.value)}
            placeholder="Araç performansını artırın..."
          />
        </div>

        {/* Hero Section */}
        <div style={styles.card}>
          <h3 style={{ color: "#00b7ff", marginBottom: 15 }}>🚀 Hero Bölümü</h3>
          <label style={styles.label}>Ana Başlık</label>
          <input
            style={styles.input}
            value={formData.hero_title}
            onChange={(e) => handleChange("hero_title", e.target.value)}
            placeholder="Profesyonel ECU Chip Tuning"
          />
          <label style={styles.label}>Alt Başlık</label>
          <textarea
            style={{ ...styles.input, minHeight: 80 }}
            value={formData.hero_subtitle}
            onChange={(e) => handleChange("hero_subtitle", e.target.value)}
            placeholder="Aracınızın performansını maksimuma çıkarın..."
          />
        </div>

        {/* About Section */}
        <div style={styles.card}>
          <h3 style={{ color: "#00b7ff", marginBottom: 15 }}>ℹ️ Hakkımızda Bölümü</h3>
          <label style={styles.label}>Başlık</label>
          <input
            style={styles.input}
            value={formData.about_title}
            onChange={(e) => handleChange("about_title", e.target.value)}
            placeholder="Hakkımızda"
          />
          <label style={styles.label}>Açıklama</label>
          <textarea
            style={{ ...styles.input, minHeight: 120 }}
            value={formData.about_text}
            onChange={(e) => handleChange("about_text", e.target.value)}
            placeholder="Nexaven olarak..."
          />
        </div>

        {/* Contact */}
        <div style={styles.card}>
          <h3 style={{ color: "#00b7ff", marginBottom: 15 }}>📞 İletişim Bilgileri</h3>
          <label style={styles.label}>E-posta</label>
          <input
            style={styles.input}
            value={formData.contact_email}
            onChange={(e) => handleChange("contact_email", e.target.value)}
            placeholder="info@nexaven.com"
          />
          <label style={styles.label}>Telefon</label>
          <input
            style={styles.input}
            value={formData.contact_phone}
            onChange={(e) => handleChange("contact_phone", e.target.value)}
            placeholder="+90 XXX XXX XX XX"
          />
        </div>

        {/* Social Media */}
        <div style={styles.card}>
          <h3 style={{ color: "#00b7ff", marginBottom: 15 }}>📱 Sosyal Medya</h3>
          <label style={styles.label}>Facebook</label>
          <input
            style={styles.input}
            value={formData.social_facebook}
            onChange={(e) => handleChange("social_facebook", e.target.value)}
            placeholder="https://facebook.com/..."
          />
          <label style={styles.label}>Twitter (X)</label>
          <input
            style={styles.input}
            value={formData.social_twitter}
            onChange={(e) => handleChange("social_twitter", e.target.value)}
            placeholder="https://twitter.com/..."
          />
          <label style={styles.label}>Instagram</label>
          <input
            style={styles.input}
            value={formData.social_instagram}
            onChange={(e) => handleChange("social_instagram", e.target.value)}
            placeholder="https://instagram.com/..."
          />
        </div>

        {/* Footer */}
        <div style={styles.card}>
          <h3 style={{ color: "#00b7ff", marginBottom: 15 }}>📝 Footer Metni</h3>
          <textarea
            style={{ ...styles.input, minHeight: 80 }}
            value={formData.footer_text}
            onChange={(e) => handleChange("footer_text", e.target.value)}
            placeholder="© 2024 Nexaven. Tüm hakları saklıdır."
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...styles.btn,
            background: saving ? "#555" : "linear-gradient(135deg, #00b7ff, #0066ff)",
            fontSize: 18,
            padding: "15px 40px",
          }}
        >
          {saving ? "Kaydediliyor..." : "💾 Değişiklikleri Kaydet"}
        </button>
      </div>
    </div>
  );
}
