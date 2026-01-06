import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [myLicenses, setMyLicenses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchUserData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    try {
      // Kullanıcı bilgilerini al
      const userRes = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      setUser(userData);

      // Lisansları al
      const licensesRes = await fetch("/api/licenses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const licensesData = await licensesRes.json();
      setMyLicenses(licensesData.filter(l => l.user_id === userData.id));

      // Taleplerim
      const requestsRes = await fetch("/api/license-requests/my-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const requestsData = await requestsRes.json();
      setMyRequests(requestsData);

      // Bildirimler
      const notifRes = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifData = await notifRes.json();
      setNotifications(notifData);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const createLicenseRequest = async (planId, planName) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/license-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: planId,
          plan_name: planName,
          amount: 0 // Fiyat bilgisi varsa eklenebilir
        })
      });
      const data = await res.json();
      if (data.id) {
        alert("✅ Lisans talebiniz oluşturuldu! Admin onayladığında bildirim alacaksınız.");
        fetchUserData();
      }
    } catch (error) {
      alert("❌ Talep oluşturulamadı!");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchUserData();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <Link to="/" style={styles.logoLink}>NEXAVEN</Link>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.username}>
            👤 {user?.username} 
            {user?.user_type === "cafe" && " 🏢"}
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Çıkış</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={activeTab === "overview" ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab("overview")}
        >
          📊 Genel Bakış
        </button>
        <button
          style={activeTab === "licenses" ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab("licenses")}
        >
          🎫 Lisanslarım
        </button>
        <button
          style={activeTab === "requests" ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab("requests")}
        >
          📋 Taleplerim
        </button>
        <button
          style={activeTab === "notifications" ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab("notifications")}
        >
          🔔 Bildirimler ({notifications.filter(n => !n.is_read).length})
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === "overview" && (
          <div>
            <h2 style={styles.heading}>Hoş Geldiniz, {user?.username}!</h2>
            
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🎫</div>
                <div style={styles.statNumber}>{myLicenses.length}</div>
                <div style={styles.statLabel}>Aktif Lisans</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>⏳</div>
                <div style={styles.statNumber}>
                  {myRequests.filter(r => r.status === "pending").length}
                </div>
                <div style={styles.statLabel}>Bekleyen Talep</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🔔</div>
                <div style={styles.statNumber}>
                  {notifications.filter(n => !n.is_read).length}
                </div>
                <div style={styles.statLabel}>Okunmamış Bildirim</div>
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.subheading}>🚀 Yeni Lisans Talep Et</h3>
              <div style={styles.planGrid}>
                <div style={styles.planCard}>
                  <h4 style={styles.planName}>Basic Plan</h4>
                  <p style={styles.planDesc}>Temel özellikler</p>
                  <button
                    style={styles.requestBtn}
                    onClick={() => createLicenseRequest(1, "Basic Plan")}
                    disabled={loading}
                  >
                    Talep Et
                  </button>
                </div>
                <div style={styles.planCard}>
                  <h4 style={styles.planName}>Pro Plan</h4>
                  <p style={styles.planDesc}>Gelişmiş özellikler</p>
                  <button
                    style={styles.requestBtn}
                    onClick={() => createLicenseRequest(2, "Pro Plan")}
                    disabled={loading}
                  >
                    Talep Et
                  </button>
                </div>
                <div style={styles.planCard}>
                  <h4 style={styles.planName}>Enterprise</h4>
                  <p style={styles.planDesc}>Tüm özellikler</p>
                  <button
                    style={styles.requestBtn}
                    onClick={() => createLicenseRequest(3, "Enterprise")}
                    disabled={loading}
                  >
                    Talep Et
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "licenses" && (
          <div>
            <h2 style={styles.heading}>🎫 Lisanslarım</h2>
            {myLicenses.length === 0 ? (
              <p style={styles.emptyText}>Henüz aktif lisansınız yok.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Lisans Anahtarı</th>
                    <th style={styles.th}>Durum</th>
                    <th style={styles.th}>Başlangıç</th>
                    <th style={styles.th}>Bitiş</th>
                  </tr>
                </thead>
                <tbody>
                  {myLicenses.map(lic => (
                    <tr key={lic.id} style={styles.tr}>
                      <td style={styles.td}>{lic.license_key}</td>
                      <td style={styles.td}>
                        <span style={lic.status === "active" ? styles.badgeActive : styles.badgeInactive}>
                          {lic.status === "active" ? "✅ Aktif" : "❌ Pasif"}
                        </span>
                      </td>
                      <td style={styles.td}>{new Date(lic.start_date).toLocaleDateString("tr-TR")}</td>
                      <td style={styles.td}>{new Date(lic.end_date).toLocaleDateString("tr-TR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div>
            <h2 style={styles.heading}>📋 Taleplerim</h2>
            {myRequests.length === 0 ? (
              <p style={styles.emptyText}>Henüz talep oluşturmadınız.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Plan</th>
                    <th style={styles.th}>Durum</th>
                    <th style={styles.th}>Tarih</th>
                    <th style={styles.th}>Admin Notu</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map(req => (
                    <tr key={req.id} style={styles.tr}>
                      <td style={styles.td}>{req.plan_name}</td>
                      <td style={styles.td}>
                        <span style={
                          req.status === "approved" ? styles.badgeActive :
                          req.status === "rejected" ? styles.badgeRejected :
                          styles.badgePending
                        }>
                          {req.status === "approved" && "✅ Onaylandı"}
                          {req.status === "rejected" && "❌ Reddedildi"}
                          {req.status === "pending" && "⏳ Bekliyor"}
                        </span>
                      </td>
                      <td style={styles.td}>{new Date(req.created_at).toLocaleDateString("tr-TR")}</td>
                      <td style={styles.td}>{req.admin_note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h2 style={styles.heading}>🔔 Bildirimler</h2>
            {notifications.length === 0 ? (
              <p style={styles.emptyText}>Henüz bildiriminiz yok.</p>
            ) : (
              <div style={styles.notifList}>
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    style={notif.is_read ? styles.notifCardRead : styles.notifCard}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                  >
                    <div style={styles.notifTitle}>{notif.title}</div>
                    <div style={styles.notifMessage}>{notif.message}</div>
                    <div style={styles.notifDate}>
                      {new Date(notif.created_at).toLocaleString("tr-TR")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    background: "rgba(26, 31, 58, 0.9)",
    borderBottom: "1px solid rgba(0, 183, 255, 0.3)",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoLink: {
    background: "linear-gradient(90deg, #00b7ff, #0066ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textDecoration: "none",
    letterSpacing: 3,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  username: {
    color: "#fff",
    fontSize: 16,
  },
  logoutBtn: {
    padding: "8px 20px",
    background: "rgba(220, 53, 69, 0.2)",
    color: "#ff6b6b",
    border: "1px solid #dc3545",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },
  tabs: {
    display: "flex",
    gap: 10,
    padding: "20px 40px",
    background: "rgba(10, 14, 39, 0.6)",
    borderBottom: "1px solid rgba(0, 183, 255, 0.2)",
  },
  tab: {
    padding: "12px 24px",
    background: "transparent",
    color: "#aaa",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.3s",
  },
  activeTab: {
    background: "linear-gradient(135deg, #00b7ff, #0066ff)",
    color: "#fff",
  },
  content: {
    padding: "40px",
  },
  heading: {
    color: "#fff",
    fontSize: 28,
    marginBottom: 30,
  },
  subheading: {
    color: "#00b7ff",
    fontSize: 20,
    marginBottom: 20,
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
  section: {
    background: "rgba(26, 31, 58, 0.6)",
    padding: 30,
    borderRadius: 12,
    border: "1px solid rgba(0, 183, 255, 0.2)",
    marginTop: 30,
  },
  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
  },
  planCard: {
    background: "rgba(10, 14, 39, 0.6)",
    padding: 20,
    borderRadius: 10,
    border: "1px solid rgba(0, 183, 255, 0.3)",
    textAlign: "center",
  },
  planName: {
    color: "#00b7ff",
    fontSize: 18,
    marginBottom: 10,
  },
  planDesc: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 20,
  },
  requestBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #00b7ff, #0066ff)",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "rgba(26, 31, 58, 0.6)",
    borderRadius: 12,
    overflow: "hidden",
  },
  th: {
    padding: 15,
    textAlign: "left",
    background: "rgba(0, 183, 255, 0.2)",
    color: "#00b7ff",
    fontSize: 14,
    fontWeight: "bold",
  },
  tr: {
    borderBottom: "1px solid rgba(0, 183, 255, 0.1)",
  },
  td: {
    padding: 15,
    color: "#fff",
    fontSize: 14,
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
  badgeRejected: {
    padding: "6px 12px",
    background: "rgba(220, 53, 69, 0.2)",
    color: "#dc3545",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    padding: 40,
  },
  notifList: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  notifCard: {
    background: "rgba(0, 183, 255, 0.1)",
    padding: 20,
    borderRadius: 10,
    border: "1px solid rgba(0, 183, 255, 0.3)",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  notifCardRead: {
    background: "rgba(26, 31, 58, 0.6)",
    padding: 20,
    borderRadius: 10,
    border: "1px solid rgba(0, 183, 255, 0.1)",
    opacity: 0.7,
  },
  notifTitle: {
    color: "#00b7ff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  notifMessage: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 10,
  },
  notifDate: {
    color: "#666",
    fontSize: 12,
  },
};
