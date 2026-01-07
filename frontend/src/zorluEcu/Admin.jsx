import { useEffect, useState } from "react";
import { apiGet, apiPost } from "./api";

const adminStyles = `
  .admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }

  .admin-header {
    margin-bottom: 32px;
    text-align: center;
  }

  .admin-header h2 {
    font-size: 32px;
    margin-bottom: 8px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .admin-header p {
    color: var(--muted);
    font-size: 14px;
  }

  .admin-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    border-bottom: 2px solid var(--border);
    padding-bottom: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .admin-tab-btn {
    padding: 10px 16px;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    border-bottom: 3px solid transparent;
    margin-bottom: -14px;
  }

  .admin-tab-btn:hover {
    color: var(--accent);
  }

  .admin-tab-btn.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  .admin-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: linear-gradient(135deg, var(--panel) 0%, rgba(255,77,79,0.05) 100%);
    border: 1px solid rgba(255,77,79,0.2);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }

  .stat-card-label {
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-card-value {
    font-size: 28px;
    font-weight: bold;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .admin-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--panel);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
  }

  .admin-table thead {
    background: rgba(255,77,79,0.1);
  }

  .admin-table th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 13px;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .admin-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
  }

  .admin-table tbody tr:hover {
    background: rgba(255,77,79,0.05);
  }

  .admin-table tbody tr:last-child td {
    border-bottom: none;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-completed {
    background: rgba(0,255,100,0.15);
    color: #00ff64;
  }

  .status-failed {
    background: rgba(255,0,0,0.15);
    color: #ff4d4f;
  }

  .status-processing {
    background: rgba(255,165,0,0.15);
    color: var(--accent-2);
  }

  .role-select {
    padding: 6px 10px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: inherit;
    cursor: pointer;
    font-size: 13px;
  }

  .role-select:hover {
    border-color: var(--accent);
  }

  .admin-error {
    background: rgba(255,77,79,0.15);
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-size: 14px;
  }

  .admin-action-btn {
    padding: 6px 12px;
    background: rgba(255,77,79,0.2);
    border: 1px solid var(--accent);
    color: var(--accent);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .admin-action-btn:hover {
    background: var(--accent);
    color: white;
  }

  .job-detail-panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .job-detail-panel pre {
    background: var(--bg);
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    line-height: 1.5;
  }
`;

export default function ZorluAdmin() {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);

  useEffect(() => {
    if (tab === "stats") loadStats();
    if (tab === "users") loadUsers();
    if (tab === "jobs") loadJobs();
    if (tab === "files") loadFiles();
    if (tab === "system") loadQueueStatus();
  }, [tab]);

  async function loadStats() {
    try { const s = await apiGet("/admin/stats"); setStats(s); } catch (e) { setErr("Stats yükleme hatası"); }
  }

  async function loadUsers() {
    try { const r = await apiGet("/admin/users"); setUsers(r.users); } catch (e) { setErr("Users yükleme hatası"); }
  }

  async function loadJobs() {
    try { const r = await apiGet("/admin/jobs?limit=100"); setJobs(r.jobs); } catch (e) { setErr("Jobs yükleme hatası"); }
  }

  async function loadFiles() {
    try { const r = await apiGet("/admin/files?limit=100"); setFiles(r.files); } catch (e) { setErr("Files yükleme hatası"); }
  }

  async function loadQueueStatus() {
    try { const r = await apiGet("/models/queue-status"); setQueueStatus(r); } catch (e) { setErr("Queue durumu alınamadı"); }
  }

  async function changeRole(userId, newRole) {
    try {
      await apiPost(`/admin/users/${userId}/role`, { role: newRole });
      loadUsers();
    } catch (e) { setErr("Rol değiştirme hatası"); }
  }

  async function viewJob(jobId) {
    try { const j = await apiGet(`/admin/jobs/${jobId}`); setSelectedJob(j); } catch (e) { setErr("Job detayı yükleme hatası"); }
  }

  return (
    <div data-zorlu-ecu style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{adminStyles}</style>
      <div className="admin-container">
        <div className="admin-header">
          <h2>⚙️ Admin Paneli</h2>
          <p>Zorlu ECU Sistem Yönetimi</p>
        </div>

        <div className="admin-tabs">
          {["stats", "users", "jobs", "files", "system"].map(t => (
            <button
              key={t}
              className={`admin-tab-btn ${tab === t ? "active" : ""}`}
              onClick={() => { setTab(t); setSelectedJob(null); }}
            >
              {t === "stats" ? "📊 İstatistikler" : t === "users" ? "👥 Kullanıcılar" : t === "jobs" ? "⚡ İşler" : t === "files" ? "📁 Dosyalar" : "🧠 Sistem"}
            </button>
          ))}
        </div>

        {err && <div className="admin-error">{err}</div>}

      {tab === "stats" && stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-card-label">Toplam Kullanıcılar</div>
            <div className="stat-card-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Tuning İşleri</div>
            <div className="stat-card-value">{stats.totalJobs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Tamamlanan</div>
            <div className="stat-card-value" style={{ color: "seagreen" }}>{stats.completedJobs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Başarısız</div>
            <div className="stat-card-value" style={{ color: "var(--accent)" }}>{stats.failedJobs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Yüklenen Dosyalar</div>
            <div className="stat-card-value">{stats.totalFiles}</div>
          </div>
        </div>
      )}

      {tab === "system" && (
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-card-label">Aktif İşler</div>
            <div className="stat-card-value">{queueStatus?.activeJobs ?? "-"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Maks Worker</div>
            <div className="stat-card-value">{queueStatus?.maxWorkers ?? "-"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Bekleyen</div>
            <div className="stat-card-value" style={{ color: "var(--accent-2)" }}>{queueStatus?.pending ?? queueStatus?.queued ?? "-"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">İşlemde</div>
            <div className="stat-card-value" style={{ color: "var(--accent-2)" }}>{queueStatus?.processing ?? "-"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Tamamlanan</div>
            <div className="stat-card-value" style={{ color: "seagreen" }}>{queueStatus?.completed ?? "-"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Başarısız</div>
            <div className="stat-card-value" style={{ color: "var(--accent)" }}>{queueStatus?.failed ?? "-"}</div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Kullanıcı Adı</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center", color: "var(--muted)" }}>Kullanıcı bulunamadı</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 500 }}>{u.username}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{u.email || "-"}</td>
                  <td>
                    <select
                      className="role-select"
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value)}
                    >
                      <option value="user">👤 Kullanıcı</option>
                      <option value="admin">⚙️ Admin</option>
                    </select>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(u.created_at).toLocaleDateString("tr-TR")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {tab === "jobs" && (
        <div>
          {selectedJob ? (
            <div className="job-detail-panel">
              <button className="admin-action-btn" onClick={() => setSelectedJob(null)} style={{ marginBottom: 12 }}>
                ← Geri Dön
              </button>
              <h3>⚡ İş Detayı #{selectedJob.id}</h3>
              <pre>{JSON.stringify(selectedJob, null, 2)}</pre>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kullanıcı</th>
                  <th>Strateji</th>
                  <th>Model</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: "center", color: "var(--muted)" }}>İş bulunamadı</td></tr>
                ) : (
                  jobs.map(j => (
                    <tr key={j.id}>
                      <td>#{j.id}</td>
                      <td style={{ fontWeight: 500 }}>{j.username}</td>
                      <td style={{ fontSize: 12 }}>{j.strategy}</td>
                      <td style={{ fontSize: 12, color: "var(--accent-2)" }}>{j.model || "balanced"}</td>
                      <td>
                        <span className={`status-badge status-${j.status}`}>
                          {j.status === "completed" ? "✓ Tamamlandı" : j.status === "failed" ? "✗ Başarısız" : j.status === "processing" ? "⏳ İşlemde" : "⏱ Beklemede"}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(j.created_at).toLocaleDateString("tr-TR")}</td>
                      <td><button className="admin-action-btn" onClick={() => viewJob(j.id)}>Detay</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "files" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Kullanıcı</th>
              <th>Dosya Adı</th>
              <th>Boyut</th>
              <th>ECU Tipi</th>
              <th>Hash</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center", color: "var(--muted)" }}>Dosya bulunamadı</td></tr>
            ) : (
              files.map(f => (
                <tr key={f.id}>
                  <td>#{f.id}</td>
                  <td style={{ fontWeight: 500 }}>{f.username}</td>
                  <td style={{ fontSize: 12 }}>{f.original_name}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{(f.size / 1024).toFixed(1)} KB</td>
                  <td style={{ fontSize: 12, color: "var(--accent-2)" }}>{f.ecu_type || "-"}</td>
                  <td style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{f.checksum}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
        </div>
      </div>
    );
}
