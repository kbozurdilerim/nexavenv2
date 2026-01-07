import { useState, useEffect } from "react";
import { apiPost, apiGet } from "./api";

export default function ZorluTuning() {
  const [strategy, setStrategy] = useState("default");
  const [parameters, setParameters] = useState("{\"boost\": 1.1}");
  const [model, setModel] = useState("balanced");
  const [models, setModels] = useState([]);
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");
  const [job, setJob] = useState(null);
  const [progress, setProgress] = useState([]);

  // Modelleri yükle
  useEffect(() => {
    const loadModels = async () => {
      try {
        const res = await apiGet("/models/models");
        if (res && res.models) {
          setModels(Object.keys(res.models));
        }
      } catch (e) {
        console.error("Model yükleme hatası:", e);
      }
    };
    loadModels();
  }, []);

  // SSE bağlantısını kur ve progress takip et
  useEffect(() => {
    if (!job) return;
    
    const url = `/api/sse/subscribe/${job}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setProgress(prev => [...prev, data]);
        
        if (data.type === "completed" || data.type === "failed" || data.type === "error") {
          eventSource.close();
          setOut(data);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [job]);

  async function onTune(e) {
    e.preventDefault();
    setErr("");
    setOut(null);
    setProgress([]);
    
    try {
      const parsed = parameters ? JSON.parse(parameters) : {};
      const res = await apiPost("/zorlu-ecu/tuning", { strategy, parameters: parsed, model });
      setJob(res.jobId);
    } catch (e) {
      setErr("Tuning gönderimi başarısız");
    }
  }

  return (
    <div>
      <h3>Tuning</h3>
      <form onSubmit={onTune} style={{ display: "grid", gap: 8, maxWidth: 460 }}>
        <input value={strategy} onChange={e => setStrategy(e.target.value)} placeholder="Strateji" />
        <select value={model} onChange={e => setModel(e.target.value)} style={{ padding: 8 }}>
          <option value="">-- Model Seç --</option>
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <textarea rows={4} value={parameters} onChange={e => setParameters(e.target.value)} placeholder="Parametreler (JSON)"></textarea>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button type="submit" disabled={job && !out}>Tuning Başlat ({model})</button>
      </form>

      {progress.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h4>İlerleme ({job})</h4>
          <div style={{ maxHeight: 200, overflowY: "auto", fontSize: 12 }}>
            {progress.map((p, i) => (
              <div key={i} style={{ marginBottom: 4, paddingLeft: 8, borderLeft: `2px solid ${p.type === "error" ? "crimson" : p.type === "completed" ? "seagreen" : "var(--accent-2)"}` }}>
                <span className="muted">[{p.type}]</span> {p.message || JSON.stringify(p).substring(0, 60)}
              </div>
            ))}
          </div>
        </div>
      )}

      {out && (
        <pre style={{ background: "var(--panel)", padding: 12, borderRadius: 6, marginTop: 12, overflowX: "auto" }}>
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
      {job && !out && <div className="muted" style={{ marginTop: 8 }}>İş #{job} işleniyor…</div>}
    </div>
  );
}
