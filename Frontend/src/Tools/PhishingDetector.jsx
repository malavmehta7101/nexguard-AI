import { useState } from "react";
import { Shield, Link, FileText } from "lucide-react";

const EXAMPLES = [
  "http://paypa1-secure-login.com/verify",
  "https://amazon-account-suspended.tk/restore",
  "http://secure.microsofft.com/login",
];

const VERDICT_STYLE = {
  SAFE:       { color: "var(--primary)", bg: "var(--primary-dim)", label: "✓ SAFE" },
  SUSPICIOUS: { color: "var(--warning)", bg: "var(--warning-dim)", label: "⚠ SUSPICIOUS" },
  PHISHING:   { color: "var(--danger)",  bg: "var(--danger-dim)",  label: "✗ PHISHING DETECTED" },
  UNKNOWN:    { color: "var(--text2)",   bg: "rgba(0,0,0,.1)",     label: "? UNKNOWN" },
};

export default function PhishingDetector() {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    const payload = mode === "url" ? { url: url.trim() } : { content: content.trim() };
    if (!payload.url && !payload.content) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/ai/phishing", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      setResult(await r.json());
    } catch (e) { setResult({ verdict: "UNKNOWN", explanation: `Error: ${e.message}`, indicators: [], recommendations: [], confidence: 0 }); }
    setLoading(false);
  };

  const vs = VERDICT_STYLE[result?.verdict] || VERDICT_STYLE.UNKNOWN;
  const riskColor = { LOW: "var(--primary)", MEDIUM: "var(--warning)", HIGH: "#ff6600", CRITICAL: "var(--danger)" };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>AI Phishing Detection</h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; ML-powered URL &amp; content analysis for phishing, spoofing, and social engineering</p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button className={`tool-tab${mode === "url" ? " active" : ""}`} onClick={() => setMode("url")}><Link size={13} /> URL Analysis</button>
        <button className={`tool-tab${mode === "content" ? " active" : ""}`} onClick={() => setMode("content")}><FileText size={13} /> Content Analysis</button>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        {mode === "url" ? (
          <>
            <div className="section-label">SUSPICIOUS URL</div>
            <div style={{ display: "flex", gap: 9, marginBottom: 10 }}>
              <input className="input" placeholder="https://suspicious-domain.com/verify-account" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && analyze()} style={{ flex: 1 }} />
              <button className="btn solid" onClick={analyze} disabled={loading || !url.trim()}>
                {loading ? <span className="spinner spin" /> : "Scan"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: "var(--text2)" }}>Examples:</span>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setUrl(ex)} style={{ background: "none", border: "none", color: "var(--cyan)", fontSize: 10, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", textDecoration: "underline" }}>{ex.slice(0, 38)}...</button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="section-label">SUSPICIOUS CONTENT / MESSAGE</div>
            <textarea className="input textarea" placeholder="Paste suspicious email body, SMS, or web page content here..." value={content} onChange={e => setContent(e.target.value)} rows={5} style={{ marginBottom: 10 }} />
            <button className="btn solid" onClick={analyze} disabled={loading || !content.trim()} style={{ width: "100%" }}>
              {loading ? <><span className="spinner spin" /> Analyzing with AI...</> : "Analyze Content"}
            </button>
          </>
        )}
      </div>

      {result && (
        <div className="card fade-up" style={{ padding: 22 }}>
          {/* Verdict Banner */}
          <div style={{ background: vs.bg, border: `1px solid ${vs.color}30`, padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div className="verdict" style={{ color: vs.color }}>{vs.label}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {result.risk_level && <span className={`tag ${result.risk_level === "CRITICAL" || result.risk_level === "HIGH" ? "d" : result.risk_level === "MEDIUM" ? "w" : "g"}`}>RISK: {result.risk_level}</span>}
              <span style={{ fontSize: 11, color: "var(--text2)" }}>Confidence: <b style={{ color: vs.color }}>{result.confidence}%</b></span>
            </div>
          </div>

          {/* Confidence Bar */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text2)", marginBottom: 5 }}>
              <span>CONFIDENCE SCORE</span><span>{result.confidence}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${result.confidence}%`, background: vs.color }} />
            </div>
          </div>

          {/* Indicators */}
          {result.indicators?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div className="section-label">PHISHING INDICATORS DETECTED</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {result.indicators.map((ind, i) => <span key={i} className="tag d">{ind}</span>)}
              </div>
            </div>
          )}

          {/* Explanation */}
          {result.explanation && (
            <div style={{ marginBottom: 18 }}>
              <div className="section-label">AI ANALYSIS</div>
              <div className="result-box">{result.explanation}</div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div>
              <div className="section-label">RECOMMENDATIONS</div>
              {result.recommendations.map((rec, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 11.5, color: "var(--text)", marginBottom: 7 }}>
                  <span style={{ color: "var(--primary)", flexShrink: 0 }}>→</span>{rec}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
