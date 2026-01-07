import { useEffect, useState } from "react";
import { apiGet, apiPost } from "./api";

export default function ZorluChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("/zorlu-ecu/chat/history");
        setMessages(res.messages || []);
      } catch (e) {
        setErr("Mesaj geçmişi alınamadı");
      }
    })();
  }, []);

  async function sendMessage(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await apiPost("/zorlu-ecu/chat/message", { text });
      setMessages((m) => [...m, { id: Date.now(), role: "user", text }, { id: Date.now() + 1, role: "assistant", text: res.reply }]);
      setText("");
    } catch (e) {
      setErr("Mesaj gönderilemedi");
    }
  }

  return (
    <div>
      <h3>Chat</h3>
      <div style={{ display: "grid", gap: 8, maxWidth: 600 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, minHeight: 160 }}>
          {messages.map((m) => (
            <div key={m.id} style={{ marginBottom: 6 }}>
              <strong>{m.role}:</strong> {m.text}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
          <input style={{ flex: 1 }} value={text} onChange={e => setText(e.target.value)} placeholder="Mesaj yazın" />
          <button type="submit">Gönder</button>
        </form>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </div>
    </div>
  );
}
