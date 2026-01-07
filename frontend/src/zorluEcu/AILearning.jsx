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
      return res;
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
    <div data-zorlu-ecu style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        <h3 style={{ textAlign: "center", marginBottom: 16 }}>🧠 AI Learning — Eşleştirme</h3>
        <div className="card" style={{ marginBottom: 12, padding: 16 }}>
          <h4>Dosya Yükle</h4>
          <form onSubmit={(e)=>e.preventDefault()} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
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
              const latest = await refreshFiles();
              if (data.metadata?.ecuType && latest?.files) {
                const same = latest.files.filter(ff => ff.ecu_type === data.metadata.ecuType && ff.id !== data.id);
                if (same.length > 0) setTarget(same[0].id);
                setOriginal(data.id);
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

      <form onSubmit={onCompare} style={{ display: "grid", gap: 8, maxWidth: 520, margin: "0 auto" }}>
        <input placeholder="Orijinal Dosya ID" value={originalFileId} onChange={e => setOriginal(e.target.value)} />
        <input placeholder="Hedef Dosya ID" value={targetFileId} onChange={e => setTarget(e.target.value)} />
        <div className="muted">Mevcut dosyalar: {files.map(f=>`#${f.id} (${f.ecu_type})`).join(", ") || "(yok)"}</div>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button type="submit">Karşılaştır</button>
      </form>
      {out && (
        <pre style={{ background: "var(--panel)", border: "1px solid var(--border)", padding: 12, borderRadius: 6, marginTop: 12 }}>
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
      </div>
    </div>
  );
}

function authHeaderNoCT() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {};
}

