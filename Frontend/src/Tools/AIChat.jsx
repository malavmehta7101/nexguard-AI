import { useState, useRef, useEffect } from "react";
import { Send, Terminal, Trash2 } from "lucide-react";

const QUICK = [
  "Explain CVE-2024-3094 (XZ Utils backdoor) in detail",
  "What is the MITRE ATT&CK framework?",
  "How do I detect SQL injection attempts in logs?",
  "Explain buffer overflow exploitation step by step",
  "What are the best practices for incident response?",
  "How does ransomware encrypt files and evade AV?",
];

export default function AIChat() {
  const [msgs, setMsgs] = useState([{
    role: "assistant",
    content: `NexGuard AI Security Assistant initialized.\n\nI'm your expert cybersecurity analyst powered by NEXGUARD AI. I specialize in:\n\n• CVE analysis & vulnerability research\n• Malware reverse engineering & behavioral analysis\n• Penetration testing methodologies\n• Threat intelligence & OSINT\n• Incident response & forensics\n• Network security & protocol analysis\n• Cryptography & authentication\n\nNo topic is off-limits for legitimate security research. What do you need to investigate?`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useRef([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg = { role: "user", content: msg };
    setMsgs(m => [...m, userMsg]);
    history.current = [...history.current, userMsg];
    setLoading(true);
    try {
      const r = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.current }),
      });
      const data = await r.json();
      const reply = data.content || data.error || "No response.";
      const assistantMsg = { role: "assistant", content: reply };
      history.current = [...history.current, assistantMsg];
      setMsgs(m => [...m, assistantMsg]);
    } catch (e) {
      setMsgs(m => [...m, { role: "assistant", content: `⚠ Connection error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const clear = () => { setMsgs([{ role: "assistant", content: "Session cleared. New conversation started." }]); history.current = []; };

  return (
    <div className="fade-up" style={{ height: "calc(100vh - 148px)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, flexShrink: 0 }}>
        <div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 3 }}>AI Security Assistant</h2>
          <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; 24/7 expert analyst · Powered by NEXGUARD AI</p>
        </div>
        <button className="btn sm" onClick={clear} style={{ gap: 6 }}><Trash2 size={12} /> Clear</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", background: "var(--surface)", border: "1px solid var(--border)", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            <div style={{ width: 30, height: 30, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, background: m.role === "user" ? "var(--cyan-dim)" : "var(--primary-dim)", border: `1px solid ${m.role === "user" ? "rgba(0,212,255,.25)" : "rgba(0,232,122,.25)"}`, color: m.role === "user" ? "var(--cyan)" : "var(--primary)" }}>
              {m.role === "user" ? "YOU" : "AI"}
            </div>
            <div style={{ maxWidth: "80%", padding: "11px 15px", fontSize: 12.5, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'JetBrains Mono', monospace", color: "var(--text)", background: m.role === "user" ? "rgba(0,212,255,.06)" : "var(--card)", border: `1px solid ${m.role === "user" ? "rgba(0,212,255,.18)" : "rgba(255,255,255,.04)"}`, alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "var(--primary-dim)", border: "1px solid rgba(0,232,122,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--primary)", fontWeight: 700 }}>AI</div>
            <div style={{ padding: "11px 15px", background: "var(--card)", border: "1px solid rgba(255,255,255,.04)", display: "flex", alignItems: "center", gap: 9, fontSize: 12 }}>
              <span className="spinner spin" /> <span style={{ color: "var(--text2)" }}>Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {msgs.length <= 1 && (
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10, flexShrink: 0 }}>
          {QUICK.map((q, i) => (
            <button key={i} onClick={() => send(q)} style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text2)", fontSize: 11, padding: "5px 11px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all .18s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,232,122,.35)"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 9, marginTop: 10, flexShrink: 0 }}>
        <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask about CVEs, malware, exploits, incident response, cryptography..." style={{ flex: 1 }} />
        <button className="btn solid" onClick={() => send()} disabled={loading || !input.trim()} style={{ flexShrink: 0, padding: "0 18px" }}>
          {loading ? <span className="spinner spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}
