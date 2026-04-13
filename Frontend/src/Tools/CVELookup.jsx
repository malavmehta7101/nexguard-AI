import { useState } from "react";
import { Database, AlertTriangle } from "lucide-react";

const QUICK_CVES = [
  "CVE-2024-3094", "CVE-2024-21413", "CVE-2024-23897",
  "CVE-2021-44228", "CVE-2017-0144", "CVE-2023-44487",
];

export default function CVELookup() {
  const [cveId, setCveId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const lookup = async (id) => {
    const target = (id || cveId).trim().toUpperCase();
    if (!target) return;
    if (!target.match(/^CVE-\d{4}-\d+$/)) {
      setResult({ cveId: target, analysis: `⚠ Invalid CVE format. Use: CVE-YYYY-NNNNN (e.g. CVE-2024-3094)` });
      return;
    }
    setCveId(target);
    setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/ai/cve", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cveId: target }),
      });
      const data = await r.json();
      setResult(data);
      setHistory(h => [target, ...h.filter(x => x !== target)].slice(0, 8));
    } catch (e) { setResult({ cveId: target, analysis: `Error: ${e.message}` }); }
    setLoading(false);
  };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>CVE Intelligence Lookup</h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; Deep vulnerability analysis · CVSS scoring · Exploitation status · Remediation steps</p>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div className="section-label">CVE IDENTIFIER</div>
        <div style={{ display: "flex", gap: 9, marginBottom: 12 }}>
          <input className="input" placeholder="CVE-2024-3094" value={cveId}
            onChange={e => setCveId(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && lookup()} style={{ flex: 1 }} />
          <button className="btn solid" onClick={() => lookup()} disabled={loading || !cveId.trim()}>
            {loading ? <span className="spinner spin" /> : <><Database size={13} /> Analyze</>}
          </button>
        </div>

        {/* Quick CVEs */}
        <div>
          <div style={{ fontSize: 10, color: "var(--text2)", marginBottom: 6 }}>QUICK ACCESS:</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {QUICK_CVES.map(cve => (
              <button key={cve} onClick={() => lookup(cve)} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--cyan)", fontSize: 10.5, padding: "4px 10px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all .18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,212,255,.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                {cve}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, color: "var(--text2)", marginBottom: 6 }}>RECENT LOOKUPS:</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {history.map(h => (
              <button key={h} onClick={() => lookup(h)} style={{ background: "var(--primary-dim)", border: "1px solid rgba(0,232,122,.2)", color: "var(--primary)", fontSize: 10, padding: "3px 8px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>{h}</button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="card fade-up" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 800, color: "var(--cyan)" }}>{result.cveId}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="tag g">CVE ANALYSIS</span>
              <span className="tag c">AI POWERED</span>
            </div>
          </div>
          <div className="result-box" style={{ maxHeight: 600, fontSize: 12.5 }}>{result.analysis}</div>
        </div>
      )}

      {!result && !loading && (
        <div className="card" style={{ padding: 22 }}>
          <div className="section-label">DATABASE COVERAGE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Total CVEs", val: "247,891+", color: "var(--cyan)" },
              { label: "Critical (CVSS ≥9)", val: "12,440+", color: "var(--danger)" },
              { label: "Actively Exploited", val: "1,243+", color: "var(--warning)" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "16px", textAlign: "center" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "var(--text2)", marginTop: 5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
