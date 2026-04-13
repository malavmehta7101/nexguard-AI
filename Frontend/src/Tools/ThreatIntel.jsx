import { useState, useEffect } from "react";
import { AlertTriangle, X, ChevronRight, RefreshCw, ExternalLink, Database } from "lucide-react";

const SEV_COLOR = { CRITICAL: "var(--danger)", HIGH: "#ff6600", MEDIUM: "var(--warning)", LOW: "var(--cyan)" };
const SEV_TAG   = { CRITICAL: "d", HIGH: "d", MEDIUM: "w", LOW: "c" };

export default function ThreatIntel() {
  const [threats,   setThreats]   = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [analysis,  setAnalysis]  = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [filter,    setFilter]    = useState("ALL");
  const [loading,   setLoading]   = useState(true);
  const [meta,      setMeta]      = useState({ source: "", updated: "", isRealTime: false });
  const [error,     setError]     = useState("");

  const fetchFeed = async () => {
    setLoading(true); setError(""); setSelected(null); setAnalysis("");
    try {
      const r    = await fetch("/api/tools/threat-feed");
      const data = await r.json();
      setThreats(data.threats || []);
      setMeta({ source: data.source || "NVD", updated: data.updated, isRealTime: data.isRealTime });
    } catch (e) {
      setError("Failed to load threat feed. Check backend is running.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchFeed(); }, []);

  const analyzeTheat = async (threat) => {
    setSelected(threat); setAnalysis(""); setAnalyzing(true);
    try {
      const r = await fetch("/api/ai/cve", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cveId: `${threat.cve} — ${threat.title}` }),
      });
      const data = await r.json();
      setAnalysis(data.analysis || "Analysis unavailable.");
    } catch (e) { setAnalysis(`Error: ${e.message}`); }
    setAnalyzing(false);
  };

  const filtered = filter === "ALL" ? threats : threats.filter(t => t.severity === filter);
  const counts   = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  threats.forEach(t => { if (counts[t.severity] !== undefined) counts[t.severity]++; });

  const fmtDate = (iso) => {
    if (!iso) return "";
    try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  };

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>Threat Intelligence Feed</h2>
          <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; Live CVE data from NVD · Click any entry for AI deep-analysis</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {meta.updated && (
            <div style={{ fontSize: 10, color: "var(--text2)" }}>
              Updated: <span style={{ color: "var(--text)" }}>{fmtDate(meta.updated)}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: meta.isRealTime ? "var(--primary)" : "var(--warning)", boxShadow: `0 0 7px ${meta.isRealTime ? "var(--primary)" : "var(--warning)"}` }} />
            <span style={{ fontSize: 10, color: meta.isRealTime ? "var(--primary)" : "var(--warning)" }}>
              {meta.isRealTime ? "LIVE NVD FEED" : "CACHED FEED"}
            </span>
          </div>
          <button className="btn sm" onClick={fetchFeed} disabled={loading} style={{ gap: 6 }}>
            <RefreshCw size={12} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Source badge */}
      {meta.source && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: 11, color: "var(--text2)" }}>
          <Database size={12} color="var(--cyan)" />
          Source: <span style={{ color: "var(--cyan)" }}>{meta.source}</span>
          {meta.isRealTime && (
            <a href="https://nvd.nist.gov" target="_blank" rel="noreferrer" style={{ color: "var(--cyan)", display: "flex", alignItems: "center", gap: 3, marginLeft: 4 }}>
              <ExternalLink size={11} /> nvd.nist.gov
            </a>
          )}
          <span style={{ marginLeft: "auto" }}>
            Showing CVSS ≥ 7.0 · Last 30 days
          </span>
        </div>
      )}

      {/* Severity Summary */}
      {threats.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {["CRITICAL","HIGH","MEDIUM","LOW"].map(s => (
            <div key={s} style={{ background: "var(--card)", border: `1px solid ${SEV_COLOR[s]}25`, padding: "10px 14px", cursor: "pointer", transition: "all .18s" }}
              onClick={() => setFilter(filter === s ? "ALL" : s)}
              onMouseEnter={e => e.currentTarget.style.borderColor = SEV_COLOR[s] + "50"}
              onMouseLeave={e => e.currentTarget.style.borderColor = SEV_COLOR[s] + "25"}>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: SEV_COLOR[s] }}>{counts[s]}</div>
              <div style={{ fontSize: 9.5, color: "var(--text2)", marginTop: 3 }}>{s}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map(f => (
          <button key={f} className={`tool-tab${filter === f ? " active" : ""}`} onClick={() => setFilter(f)} style={{ fontSize: 10.5 }}>
            {f !== "ALL" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: SEV_COLOR[f], display: "inline-block" }} />}
            {f} {f !== "ALL" && `(${counts[f]})`}
          </button>
        ))}
      </div>

      {error && <div className="alert error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 16, alignItems: "start" }}>
        {/* Feed List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 48 }}>
              <span className="spinner spin" style={{ width: 28, height: 28, borderWidth: 3, display: "inline-block", marginBottom: 14 }} />
              <div style={{ fontSize: 12, color: "var(--text2)" }}>Fetching live data from NVD...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "var(--text2)", fontSize: 12 }}>No {filter !== "ALL" ? filter : ""} threats found in current feed.</div>
          ) : filtered.map(threat => (
            <div key={threat.id} onClick={() => analyzeTheat(threat)}
              style={{ padding: "15px 16px", background: selected?.id === threat.id ? "var(--card2)" : "var(--card)", border: `1px solid ${selected?.id === threat.id ? SEV_COLOR[threat.severity] + "40" : "var(--border)"}`, cursor: "pointer", transition: "all .18s", position: "relative" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = SEV_COLOR[threat.severity] + "35"; e.currentTarget.style.background = "var(--card2)"; }}
              onMouseLeave={e => { if (selected?.id !== threat.id) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--card)"; } }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${SEV_COLOR[threat.severity]}50, transparent 55%)` }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9.5, color: SEV_COLOR[threat.severity], marginBottom: 3, fontWeight: 600 }}>{threat.cve}</div>
                  <div style={{ fontSize: 12.5, color: "var(--white)", fontWeight: 500, lineHeight: 1.4 }}>{threat.title}</div>
                </div>
                <div style={{ display: "flex", gap: 5, flexShrink: 0, flexDirection: "column", alignItems: "flex-end" }}>
                  <span className={`tag ${SEV_TAG[threat.severity] || "g"}`} style={{ fontSize: 8.5 }}>{threat.severity}</span>
                  <span className="tag c" style={{ fontSize: 8.5 }}>CVSS {threat.cvss}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <div style={{ fontSize: 10.5, color: "var(--text2)" }}>{threat.category}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {threat.exploited && <span className="tag d" style={{ fontSize: 8 }}>EXPLOITED IN WILD</span>}
                  {threat.published && <span style={{ fontSize: 9.5, color: "var(--text2)" }}>{fmtDate(threat.published)}</span>}
                  <ChevronRight size={12} color="var(--text2)" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analysis Panel */}
        {selected && (
          <div className="card slide-right" style={{ padding: 20, position: "sticky", top: 0, maxHeight: "80vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div className="section-label" style={{ marginBottom: 3 }}>AI THREAT ANALYSIS</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 800, color: SEV_COLOR[selected.severity] }}>{selected.cve}</div>
                <div style={{ fontSize: 11.5, color: "var(--text)", marginTop: 4, lineHeight: 1.5 }}>{selected.title}</div>
              </div>
              <button onClick={() => { setSelected(null); setAnalysis(""); }} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", flexShrink: 0, padding: 3 }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              <span className={`tag ${SEV_TAG[selected.severity] || "g"}`}>{selected.severity}</span>
              <span className="tag c">CVSS {selected.cvss}</span>
              <span className="tag g">{selected.category}</span>
              {selected.exploited && <span className="tag d">EXPLOITED IN WILD</span>}
            </div>

            {/* NVD References */}
            {selected.refs?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div className="section-label">NVD REFERENCES</div>
                {selected.refs.map((ref, i) => (
                  <a key={i} href={ref} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--cyan)", marginBottom: 4, textDecoration: "none", wordBreak: "break-all" }}>
                    <ExternalLink size={10} style={{ flexShrink: 0 }} />
                    {ref.slice(0, 55)}{ref.length > 55 ? "..." : ""}
                  </a>
                ))}
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <div className="section-label">CLAUDE AI DEEP ANALYSIS</div>
              {analyzing ? (
                <div style={{ display: "flex", gap: 9, alignItems: "center", color: "var(--text2)", fontSize: 12, padding: "16px 0" }}>
                  <span className="spinner spin" /> Analyzing threat intelligence...
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{analysis}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
