import { useState } from "react";
import { Mail } from "lucide-react";

const VERDICT_STYLE = {
  SAFE:      { color: "var(--primary)", label: "✓ SAFE" },
  SUSPICIOUS:{ color: "var(--warning)", label: "⚠ SUSPICIOUS" },
  MALICIOUS: { color: "var(--danger)",  label: "✗ MALICIOUS" },
  ANALYSIS_COMPLETE: { color: "var(--cyan)", label: "◈ ANALYZED" },
};

const SAMPLE_HEADERS = `From: "PayPal Security" <security@paypa1.com>
Reply-To: collect@gmail.com
Return-Path: bounce@spammer.ru
Received: from unknown (185.220.101.45)
Subject: URGENT: Your account has been suspended
X-Mailer: Mass Mailer Pro 2.1`;

const SAMPLE_BODY = `Dear Valued Customer,

We have detected suspicious activity on your PayPal account. Your account has been LIMITED.

To restore access IMMEDIATELY, click here:
http://paypa1-secure-restore.com/verify?token=abc123

You must verify within 24 HOURS or your account will be permanently closed.

PayPal Security Team`;

export default function EmailAnalyzer() {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!body.trim() && !headers.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/ai/email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, subject, headers, body }),
      });
      setResult(await r.json());
    } catch (e) { setResult({ verdict: "ANALYSIS_COMPLETE", analysis: `Error: ${e.message}`, indicators: [], recommendations: [] }); }
    setLoading(false);
  };

  const loadSample = () => { setSender('security@paypa1.com'); setSubject('URGENT: Your account has been suspended'); setHeaders(SAMPLE_HEADERS); setBody(SAMPLE_BODY); };

  const vs = VERDICT_STYLE[result?.verdict] || VERDICT_STYLE.ANALYSIS_COMPLETE;

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>Smart Email Content Analyzer</h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; Full forensic analysis: headers, SPF/DKIM/DMARC, BEC patterns, social engineering</p>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 0 }}>EMAIL DETAILS</div>
          <button className="btn sm cyan" onClick={loadSample}>Load Sample Phishing Email</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <div className="section-label">FROM / SENDER</div>
            <input className="input" placeholder="security@paypa1.com" value={sender} onChange={e => setSender(e.target.value)} />
          </div>
          <div>
            <div className="section-label">SUBJECT LINE</div>
            <input className="input" placeholder="URGENT: Your account has been suspended" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="section-label">EMAIL HEADERS (optional but recommended)</div>
          <textarea className="input textarea" rows={4} placeholder={`From: ...\nReply-To: ...\nReturn-Path: ...\nReceived: from ...\nX-Mailer: ...`} value={headers} onChange={e => setHeaders(e.target.value)} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div className="section-label">EMAIL BODY</div>
          <textarea className="input textarea" rows={6} placeholder="Paste the email body here..." value={body} onChange={e => setBody(e.target.value)} />
        </div>

        <button className="btn solid" onClick={analyze} disabled={loading || (!body.trim() && !headers.trim())} style={{ width: "100%" }}>
          {loading ? <><span className="spinner spin" /> Analyzing email with AI...</> : <><Mail size={13} /> Analyze Email</>}
        </button>
      </div>

      {result && (
        <div className="card fade-up" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
            <div className="verdict" style={{ color: vs.color }}>{vs.label}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {result.threat_type && <span className="tag d">{result.threat_type}</span>}
              <span style={{ fontSize: 11, color: "var(--text2)" }}>Confidence: <b style={{ color: vs.color }}>{result.confidence}%</b></span>
            </div>
          </div>

          {result.confidence > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${result.confidence}%`, background: vs.color }} />
              </div>
            </div>
          )}

          {result.indicators?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-label">THREAT INDICATORS</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {result.indicators.map((ind, i) => <span key={i} className="tag d">{ind}</span>)}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            {result.header_analysis && (
              <div>
                <div className="section-label">HEADER ANALYSIS</div>
                <div className="result-box" style={{ maxHeight: 200, fontSize: 11.5 }}>{result.header_analysis}</div>
              </div>
            )}
            {result.body_analysis && (
              <div>
                <div className="section-label">BODY ANALYSIS</div>
                <div className="result-box" style={{ maxHeight: 200, fontSize: 11.5 }}>{result.body_analysis}</div>
              </div>
            )}
          </div>

          {(result.analysis || (!result.header_analysis && !result.body_analysis)) && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-label">FULL ANALYSIS</div>
              <div className="result-box">{result.analysis}</div>
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <div>
              <div className="section-label">RECOMMENDED ACTIONS</div>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 11.5, color: "var(--text)", marginBottom: 6 }}>
                  <span style={{ color: "var(--primary)", flexShrink: 0 }}>→</span>{r}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
