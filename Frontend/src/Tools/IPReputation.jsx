import { useState } from "react";
import { Globe } from "lucide-react";

const RISK_COLOR = { LOW: "var(--primary)", MEDIUM: "var(--warning)", HIGH: "#ff6600", CRITICAL: "var(--danger)", UNKNOWN: "var(--text2)" };

export default function IPReputation() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!ip.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/ai/ip", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ip.trim() }),
      });
      setResult(await r.json());
    } catch (e) { setResult({ error: e.message }); }
    setLoading(false);
  };

  const rc = RISK_COLOR[result?.risk_level] || "var(--text2)";

  const SAMPLES = ["185.220.101.45", "8.8.8.8", "192.168.1.1", "94.102.49.190"];

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>IP Reputation Checker</h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; AI-powered IP threat analysis · Tor exit nodes · VPN detection · Botnet C2 intelligence</p>
      </div>

      <div className="alert info" style={{ marginBottom: 18 }}>
        ◈ Analysis is AI knowledge-based. For production use, integrate VirusTotal, AbuseIPDB, or Shodan APIs alongside this tool.
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div className="section-label">TARGET IP ADDRESS</div>
        <div style={{ display: "flex", gap: 9, marginBottom: 10 }}>
          <input className="input" placeholder="185.220.101.45" value={ip}
            onChange={e => setIp(e.target.value)}
            onKeyDown={e => e.key === "Enter" && check()}
            style={{ flex: 1 }} />
          <button className="btn solid" onClick={check} disabled={loading || !ip.trim()}>
            {loading ? <span className="spinner spin" /> : <><Globe size={13} /> Analyze</>}
          </button>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: "var(--text2)" }}>Try:</span>
          {SAMPLES.map(s => (
            <button key={s} onClick={() => setIp(s)} style={{ background: "none", border: "none", color: "var(--cyan)", fontSize: 10.5, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", textDecoration: "underline" }}>{s}</button>
          ))}
        </div>
      </div>

      {result && !result.error && (
        <div className="card fade-up" style={{ padding: 22 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, color: rc }}>
              {result.risk_level || "UNKNOWN"} RISK
            </div>
            {result.use_case   && <span className="tag c">{result.use_case}</span>}
            {result.ip_type    && <span className="tag g">{result.ip_type}</span>}
            {result.region     && <span className="tag m">{result.region}</span>}
          </div>

          {result.threat_indicators?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-label">THREAT INDICATORS</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {result.threat_indicators.map((t, i) => <span key={i} className="tag d">{t}</span>)}
              </div>
            </div>
          )}

          {result.analysis && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-label">ANALYSIS</div>
              <div className="result-box">{result.analysis}</div>
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <div>
              <div className="section-label">RECOMMENDATIONS</div>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 11.5, color: "var(--text)", marginBottom: 6 }}>
                  <span style={{ color: "var(--primary)", flexShrink: 0 }}>→</span>{r}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result?.error && <div className="alert error">⚠ {result.error}</div>}
    </div>
  );
}
