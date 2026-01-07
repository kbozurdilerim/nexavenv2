import { useEffect, useState } from "react";
import { apiGet } from "./api";

export default function ZorluDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("/zorlu-ecu/dashboard");
        setData(res);
      } catch (e) {
        setErr("Dashboard verisi alınamadı");
      }
    })();
  }, []);

  if (err) return <div className="admin-error">{err}</div>;
  if (!data) return <div style={{ textAlign: "center", padding: 24 }}>Yükleniyor…</div>;

  return (
    <div data-zorlu-ecu style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h3>🚗 Dashboard</h3>
          <div className="muted">Genel durum özetiniz</div>
        </div>
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-card-label">Tuned Vehicles</div>
            <div className="stat-card-value">{data.summary?.tunedVehicles ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Pending Comparisons</div>
            <div className="stat-card-value" style={{ color: "var(--accent-2)" }}>{data.summary?.pendingComparisons ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">AI Models</div>
            <div className="stat-card-value">{data.summary?.aiModels ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Last Run</div>
            <div className="stat-card-value" style={{ fontSize: 16 }}>{new Date(data.summary?.lastRunAt).toLocaleString("tr-TR")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
