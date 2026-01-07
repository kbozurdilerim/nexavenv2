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

  if (err) return <div style={{ color: "crimson" }}>{err}</div>;
  if (!data) return <div>Yükleniyor…</div>;

  return (
    <div>
      <h3>Dashboard</h3>
      <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 6 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
