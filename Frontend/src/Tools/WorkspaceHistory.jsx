import { useState, useEffect } from "react";
import { Clock, Trash2, Download, Search, X, ChevronRight, AlertTriangle, CheckCircle, Shield } from "lucide-react";

const STORAGE_KEY = "nexguard_workspace";
const MAX_HISTORY = 50;

// ── Public API to save scans from other tools ─────────────────────────────────
export function saveToWorkspace(toolName, query, result, verdict) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const entry = {
      id:        Date.now(),
      tool:      toolName,
      query,
      verdict,
      result:    JSON.stringify(result).slice(0, 2000), // cap size
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...existing].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

const TOOL_COLORS = {
  "Phishing Detection": "var(--primary)",
  "VirusTotal":         "var(--danger)",
  "Breach Monitor":     "var(--danger)",
  "SSL Analyzer":       "var(--cyan)",
  "DNS Lookup":         "var(--cyan)",
  "Subdomain Enum":     "var(--warning)",
  "CVE Lookup":         "var(--cyan)",
  "Malware Detection":  "var(--danger)",
  "IP Reputation":      "var(--warning)",
  "Email Analyzer":     "var(--primary)",
  "Deepfake Analyzer":  "var(--warning)",
  "AbuseIPDB":          "var(--danger)",
};

const VERDICT_ICON = {
  MALICIOUS:  <AlertTriangle size={13} color="var(--danger)"  />,
  PHISHING:   <AlertTriangle size={13} color="var(--danger)"  />,
  CRITICAL:   <AlertTriangle size={13} color="var(--danger)"  />,
  HIGH:       <AlertTriangle size={13} color="#ff6600"        />,
  SUSPICIOUS: <AlertTriangle size={13} color="var(--warning)" />,
  CLEAN:      <CheckCircle   size={13} color="var(--primary)" />,
  SAFE:       <CheckCircle   size={13} color="var(--primary)" />,
  AUTHENTIC:  <CheckCircle   size={13} color="var(--primary)" />,
};

export default function WorkspaceHistory() {
  const [history, setHistory]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("");
  const [toolFilter, setTool]   = useState("ALL");

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = () => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setHistory(data);
    } catch { setHistory([]); }
  };

  const deleteEntry = (id) => {
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
    if (selected?.id === id) setSelected(null);
  };

  const clearAll = () => {
    if (!window.confirm("Clear all scan history? This cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]); setSelected(null);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `nexguard-history-${Date.now()}.json`;
    a.click();
  };

  const tools    = ["ALL", ...new Set(history.map(h => h.tool))];
  const filtered = history.filter(h => {
    const matchTool  = toolFilter === "ALL" || h.tool === toolFilter;
    const matchQuery = !filter || h.query?.toLowerCase().includes(filter.toLowerCase()) || h.verdict?.toLowerCase().includes(filter.toLowerCase());
    return matchTool && matchQuery;
  });

  const fmtTime = (iso) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = now - d;
      if (diff < 60000)  return "just now";
      if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
      return d.toLocaleDateString();
    } catch { return ""; }
  };

  // Add demo entries if empty
  const addDemoEntries = () => {
    const demos = [
      { id: Date.now()-5, tool: "Phishing Detection", query: "http://paypa1-secure.com/verify", verdict: "PHISHING",   result: '{"confidence":94}', timestamp: new Date(Date.now()-300000).toISOString() },
      { id: Date.now()-4, tool: "SSL Analyzer",       query: "github.com",                      verdict: "A+",         result: '{"grade":"A+","days_remaining":290}', timestamp: new Date(Date.now()-600000).toISOString() },
      { id: Date.now()-3, tool: "CVE Lookup",         query: "CVE-2024-3094",                   verdict: "CRITICAL",   result: '{"cvss":"10.0"}', timestamp: new Date(Date.now()-900000).toISOString() },
      { id: Date.now()-2, tool: "Breach Monitor",     query: "test@example.com",                verdict: "BREACHED",   result: '{"breach_count":4}', timestamp: new Date(Date.now()-1200000).toISOString() },
      { id: Date.now()-1, tool: "VirusTotal",         query: "185.220.101.45",                  verdict: "SUSPICIOUS", result: '{"stats":{"malicious":2}}', timestamp: new Date(Date.now()-1500000).toISOString() },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
    setHistory(demos);
  };

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>
            User Workspace &amp; History
          </h2>
          <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; All your scan results saved locally — no account needed · {history.length}/{MAX_HISTORY} entries</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {history.length > 0 && (
            <>
              <button className="btn sm cyan" onClick={exportJSON}><Download size={12}/> Export JSON</button>
              <button className="btn sm danger" onClick={clearAll}><Trash2 size={12}/> Clear All</button>
            </>
          )}
        </div>
      </div>

      <div className="alert info" style={{ marginBottom: 18 }}>
        ◈ Scan history is saved in your browser's <strong style={{ color: "var(--white)" }}>localStorage</strong> — private to your device, never sent to any server.
        History persists until you clear it or your browser data.
      </div>

      {/* Empty state */}
      {history.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <Clock size={40} color="var(--muted)" style={{ marginBottom: 14 }} />
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--white)", marginBottom: 8 }}>No Scan History Yet</div>
          <p style={{ fontSize: 12, color: "var(--text2)", marginBottom: 22, lineHeight: 1.7 }}>
            Run any scan from the tools in the sidebar.<br/>Results will automatically appear here.
          </p>
          <button className="btn sm cyan" onClick={addDemoEntries}>Load Demo History</button>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 9, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <input className="input" placeholder="Search queries or verdicts..." value={filter}
                onChange={e => setFilter(e.target.value)} style={{ paddingLeft: 36 }} />
              <Search size={13} color="var(--muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <select className="input" value={toolFilter} onChange={e => setTool(e.target.value)}
              style={{ width: "auto", cursor: "pointer", paddingLeft: 10 }}>
              {tools.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 16 }}>
            {/* History list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 24, color: "var(--text2)", fontSize: 12 }}>No entries match your filter.</div>
              ) : filtered.map(entry => {
                const tc = TOOL_COLORS[entry.tool] || "var(--primary)";
                const vi = VERDICT_ICON[entry.verdict?.toUpperCase()] || <Shield size={13} color="var(--text2)"/>;
                return (
                  <div key={entry.id}
                    onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
                    style={{ padding: "12px 14px", background: selected?.id === entry.id ? "var(--card2)" : "var(--card)", border: `1px solid ${selected?.id === entry.id ? tc + "40" : "var(--border)"}`, cursor: "pointer", transition: "all .18s", position: "relative" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = tc + "30"; e.currentTarget.style.background = "var(--card2)"; }}
                    onMouseLeave={e => { if (selected?.id !== entry.id) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--card)"; } }}>
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: tc }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                          <span className="tag" style={{ background: tc + "18", border: `1px solid ${tc}30`, color: tc, fontSize: 8.5 }}>{entry.tool}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                            {vi}
                            <span style={{ color: "var(--text)" }}>{entry.verdict}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--white)", fontFamily: "'JetBrains Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entry.query}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: "var(--text2)" }}>{fmtTime(entry.timestamp)}</span>
                        <button onClick={e => { e.stopPropagation(); deleteEntry(entry.id); }}
                          style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", padding: 2 }}
                          onMouseEnter={e => e.currentTarget.style.color = "var(--danger)"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}>
                          <X size={13}/>
                        </button>
                        <ChevronRight size={12} color="var(--muted)"/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="card slide-right" style={{ padding: 20, position: "sticky", top: 0, maxHeight: "70vh", overflow: "auto", height: "fit-content" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div className="section-label" style={{ marginBottom: 3 }}>SCAN DETAILS</div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, color: TOOL_COLORS[selected.tool] || "var(--primary)" }}>{selected.tool}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer" }}><X size={15}/></button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
                  {[
                    ["Query",     selected.query],
                    ["Verdict",   selected.verdict],
                    ["Timestamp", new Date(selected.timestamp).toLocaleString()],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "9px 13px" }}>
                      <div style={{ fontSize: 9.5, color: "var(--text2)", marginBottom: 3 }}>{k.toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: "var(--white)", fontFamily: "'JetBrains Mono',monospace", wordBreak: "break-all" }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="section-label">RAW RESULT</div>
                <div className="result-box" style={{ fontSize: 11 }}>
                  {(() => { try { return JSON.stringify(JSON.parse(selected.result), null, 2); } catch { return selected.result; } })()}
                </div>

                <button className="btn sm danger" onClick={() => deleteEntry(selected.id)} style={{ marginTop: 14 }}>
                  <Trash2 size={12}/> Delete Entry
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
