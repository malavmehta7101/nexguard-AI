import { useState } from "react";
import { Shield, Link, Globe, Hash } from "lucide-react";

const VERDICT_STYLE = {
  MALICIOUS:  { color: "var(--danger)",  label: "✗ MALICIOUS",  tag: "d" },
  SUSPICIOUS: { color: "var(--warning)", label: "⚠ SUSPICIOUS", tag: "w" },
  CLEAN:      { color: "var(--primary)", label: "✓ CLEAN",      tag: "g" },
  UNKNOWN:    { color: "var(--text2)",   label: "? UNKNOWN",    tag: "g" },
};

export default function VirusTotalScanner() {
  const [scanType, setScanType] = useState("url");
  const [target, setTarget]     = useState("");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);

  const scan = async () => {
    if (!target.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/p2/virustotal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim(), type: scanType }),
      });
      setResult(await r.json());
    } catch (e) { setResult({ error: e.message }); }
    setLoading(false);
  };

  const vs = VERDICT_STYLE[result?.verdict] || VERDICT_STYLE.UNKNOWN;
  const total = result ? Object.values(result.stats || {}).reduce((a, b) => a + b, 0) : 0;

  const STAT_COLORS = {
    malicious:  "var(--danger)",
    suspicious: "var(--warning)",
    harmless:   "var(--primary)",
    undetected: "var(--text2)",
    timeout:    "var(--muted)",
  };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>
          VirusTotal Scanner
        </h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>
          &gt; Scan URLs, IPs and file hashes against 70+ antivirus engines
        </p>
      </div>

      {/* Scan type tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[["url","URL","link"],["ip","IP Address","globe"],["hash","File Hash","hash"]].map(([t, label]) => (
          <button key={t} className={`tool-tab${scanType === t ? " active" : ""}`} onClick={() => { setScanType(t); setResult(null); setTarget(""); }}>
            {t === "url" ? <Link size={13}/> : t === "ip" ? <Globe size={13}/> : <Hash size={13}/>} {label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        {result?.demo && (
          <div className="alert warn" style={{ marginBottom: 14 }}>
            ⚠ DEMO MODE — Add <code style={{ color: "var(--primary)" }}>VIRUSTOTAL_API_KEY</code> to <code style={{ color: "var(--primary)" }}>backend/.env</code> for real 70+ engine scanning.
          </div>
        )}
        <div className="section-label">
          {scanType === "url" ? "ENTER URL TO SCAN" : scanType === "ip" ? "ENTER IP ADDRESS" : "ENTER FILE HASH (MD5/SHA-1/SHA-256)"}
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <input className="input" style={{ flex: 1 }}
            placeholder={scanType === "url" ? "https://suspicious-site.com" : scanType === "ip" ? "185.220.101.45" : "d41d8cd98f00b204e9800998ecf8427e"}
            value={target} onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && scan()} />
          <button className="btn solid" onClick={scan} disabled={loading || !target.trim()}>
            {loading ? <span className="spinner spin"/> : <><Shield size={13}/> Scan</>}
          </button>
        </div>
      </div>

      {result && !result.error && (
        <div className="card fade-up" style={{ padding: 22 }}>
          {/* Verdict */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, color: vs.color }}>{vs.label}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className={`tag ${vs.tag}`}>{result.type?.toUpperCase()}</span>
              {result.reputation !== undefined && (
                <span className={`tag ${result.reputation < 0 ? "d" : "g"}`}>
                  REP: {result.reputation > 0 ? "+" : ""}{result.reputation}
                </span>
              )}
            </div>
          </div>

          {/* Engine stats */}
          {result.stats && (
            <div style={{ marginBottom: 20 }}>
              <div className="section-label">SCAN RESULTS — {total} ENGINES</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 12 }}>
                {Object.entries(result.stats).map(([k, v]) => (
                  <div key={k} style={{ background: "var(--surface)", border: `1px solid ${STAT_COLORS[k]}30`, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, color: STAT_COLORS[k] }}>{v}</div>
                    <div style={{ fontSize: 9, color: "var(--text2)", marginTop: 3, textTransform: "uppercase" }}>{k}</div>
                  </div>
                ))}
              </div>
              {/* Visual bar */}
              {total > 0 && (
                <div style={{ display: "flex", height: 8, borderRadius: 0, overflow: "hidden" }}>
                  {Object.entries(result.stats).filter(([,v]) => v > 0).map(([k, v]) => (
                    <div key={k} style={{ width: `${(v/total)*100}%`, background: STAT_COLORS[k], transition: "width 1s" }} title={`${k}: ${v}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Engine results */}
          {result.engines?.length > 0 && (
            <div>
              <div className="section-label">NOTABLE ENGINE RESULTS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {result.engines.map((eng, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: 11 }}>
                    <span style={{ color: "var(--text)" }}>{eng.engine}</span>
                    <span className={`tag ${eng.category === "malicious" ? "d" : eng.category === "suspicious" ? "w" : eng.category === "harmless" ? "g" : "c"}`} style={{ fontSize: 8.5 }}>
                      {eng.result || eng.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.message && <div className="alert info" style={{ marginTop: 14 }}>{result.message}</div>}
        </div>
      )}
      {result?.error && <div className="alert error">⚠ {result.error}</div>}
    </div>
  );
}
