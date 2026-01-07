import { useEffect, useState } from "react";
import { apiGet, apiPost } from "./api";

export default function ZorluAdmin() {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (tab === "stats") loadStats();
    if (tab === "users") loadUsers();
    if (tab === "jobs") loadJobs();
    if (tab === "files") loadFiles();
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
    <div>
      <h3>Admin Panel</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        {["stats", "users", "jobs", "files"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "#fff" : "inherit" }}>
            {t === "stats" ? "İstatistikler" : t === "users" ? "Kullanıcılar" : t === "jobs" ? "İşler" : "Dosyalar"}
          </button>
        ))}
      </div>

      {err && <div style={{ color: "var(--accent)", marginBottom: 12 }}>{err}</div>}

      {tab === "stats" && stats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 500 }}>
          <div className="card"><div>Kullanıcılar</div><div style={{ fontSize: 24, fontWeight: "bold" }}>{stats.totalUsers}</div></div>
          <div className="card"><div>Toplam İşler</div><div style={{ fontSize: 24, fontWeight: "bold" }}>{stats.totalJobs}</div></div>
          <div className="card"><div>Tamamlanan</div><div style={{ fontSize: 24, fontWeight: "bold", color: "seagreen" }}>{stats.completedJobs}</div></div>
          <div className="card"><div>Başarısız</div><div style={{ fontSize: 24, fontWeight: "bold", color: "var(--accent)" }}>{stats.failedJobs}</div></div>
          <div className="card" style={{ gridColumn: "1/-1" }}><div>Dosyalar</div><div style={{ fontSize: 24, fontWeight: "bold" }}>{stats.totalFiles}</div></div>
        </div>
      )}

      {tab === "users" && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: 8 }}>ID</th>
              <th style={{ textAlign: "left", padding: 8 }}>Kullanıcı</th>
              <th style={{ textAlign: "left", padding: 8 }}>Email</th>
              <th style={{ textAlign: "left", padding: 8 }}>Rol</th>
              <th style={{ textAlign: "left", padding: 8 }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 8 }}>{u.id}</td>
                <td style={{ padding: 8 }}>{u.username}</td>
                <td style={{ padding: 8, fontSize: 12, color: "var(--muted)" }}>{u.email}</td>
                <td style={{ padding: 8 }}>
                  <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <small style={{ color: "var(--muted)" }}>{new Date(u.created_at).toLocaleDateString("tr-TR")}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "jobs" && (
        <div>
          {selectedJob ? (
            <div className="card" style={{ marginBottom: 12 }}>
              <button onClick={() => setSelectedJob(null)}>← Geri</button>
              <h4>Job #{selectedJob.id}</h4>
              <pre>{JSON.stringify(selectedJob, null, 2)}</pre>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: 8 }}>ID</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Kullanıcı</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Stratejisi</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Durum</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Tarih</th>
                  <th style={{ textAlign: "left", padding: 8 }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: 8 }}>{j.id}</td>
                    <td style={{ padding: 8 }}>{j.username}</td>
                    <td style={{ padding: 8, fontSize: 12 }}>{j.strategy}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{ background: j.status === "completed" ? "rgba(0,255,0,0.1)" : j.status === "failed" ? "rgba(255,0,0,0.1)" : "rgba(255,165,0,0.1)", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>
                        {j.status}
                      </span>
                    </td>
                    <td style={{ padding: 8, fontSize: 11, color: "var(--muted)" }}>{new Date(j.created_at).toLocaleDateString("tr-TR")}</td>
                    <td style={{ padding: 8 }}><button onClick={() => viewJob(j.id)}>Detay</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "files" && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: 8 }}>ID</th>
              <th style={{ textAlign: "left", padding: 8 }}>Kullanıcı</th>
              <th style={{ textAlign: "left", padding: 8 }}>Dosya Adı</th>
              <th style={{ textAlign: "left", padding: 8 }}>Boyut</th>
              <th style={{ textAlign: "left", padding: 8 }}>Hash</th>
            </tr>
          </thead>
          <tbody>
            {files.map(f => (
              <tr key={f.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 8 }}>{f.id}</td>
                <td style={{ padding: 8 }}>{f.username}</td>
                <td style={{ padding: 8, fontSize: 11 }}>{f.original_name}</td>
                <td style={{ padding: 8, fontSize: 11, color: "var(--muted)" }}>{(f.size / 1024).toFixed(1)} KB</td>
                <td style={{ padding: 8, fontSize: 10, fontFamily: "monospace", color: "var(--muted)" }}>{f.checksum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
