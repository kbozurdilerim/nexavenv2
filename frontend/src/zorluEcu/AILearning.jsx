import { useEffect, useState } from "react";
import { apiPost, apiGet } from "./api";

export default function ZorluAILearning() {
  const [originalFileId, setOriginal] = useState("");
  const [targetFileId, setTarget] = useState("");
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");
  const [files, setFiles] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [uploading, setUploading] = useState(false);

  const refreshFiles = async () => {
    try {
      const res = await apiGet("/zorlu-ecu/files");
      setFiles(res.files || []);
      setSuggestions(res.suggestions || {});
    } catch {}
  };

  useEffect(() => { refreshFiles(); }, []);

  async function onCompare(e) {
    e.preventDefault();
    setErr("");
    setOut(null);
    try {
      const res = await apiPost("/zorlu-ecu/compare", { fileA: Number(originalFileId), fileB: Number(targetFileId) });
      setOut(res);
    } catch (e) {
      setErr("Karşılaştırma başarısız");
    }
  }

  return (
    <div>
      <h3>AI Learning — Eşleştirme</h3>
      <div className="card" style={{ marginBottom: 12 }}>
        <h4>Dosya Yükle</h4>
        <form onSubmit={(e)=>e.preventDefault()} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="file" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setUploading(true);
            try {
              const fd = new FormData();
              fd.append("file", f);
              const res = await fetch("/api/zorlu-ecu/files/upload", { method: "POST", headers: { ...authHeaderNoCT() }, body: fd });
              if (!res.ok) throw new Error(await res.text());
              const data = await res.json();
              setErr("");
              refreshFiles();
              // Otomatik öner: aynı tipi seç
              if (data.metadata?.ecuType) {
                setTimeout(() => {
                  const same = files.filter(f => f.ecu_type === data.metadata.ecuType && f.id !== data.id);
                  if (same.length > 0) {
                    setTargetFileId(same[0].id);
                  }
                }, 200);
              }
            } catch (e) { setErr("Yükleme başarısız"); } finally { setUploading(false); }
          }} />
          {uploading && <span className="muted">Yükleniyor…</span>}
        </form>
      </div>

      {Object.keys(suggestions).length > 0 && (
        <div className="card" style={{ marginBottom: 12, background: "rgba(255,140,26,0.1)", borderColor: "rgba(255,140,26,0.3)" }}>
          <h4 style={{ color: "var(--accent-2)" }}>Önerilen Karşılaştırmalar</h4>
          {Object.entries(suggestions).map(([ecuType, ids]) => (
            <div key={ecuType} style={{ marginBottom: 8 }}>
              <strong>{ecuType}:</strong> {ids.map(id => {
                const f = files.find(f => f.id === id);
                return <button key={id} onClick={() => { setOriginal(ids[0]); setTarget(id); }} style={{ margin: 4, padding: 4 }}>
                  #{id} {f?.original_name?.substring(0, 20)}
                </button>;
              })}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={onCompare} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <input placeholder="Orijinal Dosya ID" value={originalFileId} onChange={e => setOriginal(e.target.value)} />
        <input placeholder="Hedef Dosya ID" value={targetFileId} onChange={e => setTarget(e.target.value)} />
        <div className="muted">Mevcut dosyalar: {files.map(f=>`#${f.id} (${f.ecu_type})`).join(", ") || "(yok)"}</div>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button type="submit">Karşılaştır</button>
      </form>
      {out && (
        <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 6, marginTop: 12 }}>
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
    </div>
  );
}

function authHeaderNoCT() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {};
}

