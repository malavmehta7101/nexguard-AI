import { useState } from "react";
import { Lock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const GRADE_STYLE = {
  "A+": { color: "var(--primary)", bg: "var(--primary-dim)" },
  "A":  { color: "var(--primary)", bg: "var(--primary-dim)" },
  "B":  { color: "var(--cyan)",    bg: "var(--cyan-dim)" },
  "C":  { color: "var(--warning)", bg: "var(--warning-dim)" },
  "F":  { color: "var(--danger)",  bg: "var(--danger-dim)" },
};

export default function SSLAnalyzer() {
  const [domain, setDomain]   = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!domain.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/p2/ssl", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      setResult(await r.json());
    } catch (e) { setResult({ error: e.message }); }
    setLoading(false);
  };

  const gs = result ? (GRADE_STYLE[result.grade] || GRADE_STYLE["C"]) : null;

  const Check = ({ ok, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)" }}>
      {ok
        ? <CheckCircle size={14} color="var(--primary)" />
        : <XCircle     size={14} color="var(--danger)"  />}
      <span style={{ fontSize: 12, color: ok ? "var(--text)" : "var(--text2)" }}>{label}</span>
    </div>
  );

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>SSL/TLS Certificate Analyzer</h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; Certificate validity, expiry, TLS version, cipher strength, HSTS, and security grade</p>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div className="section-label">DOMAIN NAME</div>
        <div style={{ display: "flex", gap: 9 }}>
          <input className="input" style={{ flex: 1 }} placeholder="github.com" value={domain}
            onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === "Enter" && analyze()} />
          <button className="btn solid" onClick={analyze} disabled={loading || !domain.trim()}>
            {loading ? <span className="spinner spin"/> : <><Lock size={13}/> Analyze</>}
          </button>
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
          {["github.com","google.com","humber.ca","expired.badssl.com"].map(d => (
            <button key={d} onClick={() => setDomain(d)} style={{ background: "none", border: "none", color: "var(--cyan)", fontSize: 10.5, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", textDecoration: "underline" }}>{d}</button>
          ))}
        </div>
      </div>

      {result && !result.error && (
        <div className="card fade-up" style={{ padding: 22 }}>
          {/* Grade + domain header */}
          <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
            <div style={{ width: 80, height: 80, background: gs.bg, border: `2px solid ${gs.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "Syne, sans-serif", fontSize: 36, fontWeight: 800, color: gs.color }}>{result.grade}</span>
            </div>
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>{result.domain}</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {result.valid
                  ? <span className="tag g">✓ VALID CERT</span>
                  : <span className="tag d">✗ EXPIRED</span>}
                {result.self_signed && <span className="tag w">SELF-SIGNED</span>}
                {result.wildcard    && <span className="tag c">WILDCARD</span>}
                <span className={`tag ${result.hsts ? "g" : "w"}`}>HSTS: {result.hsts ? "ENABLED" : "DISABLED"}</span>
              </div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 800, color: result.days_remaining > 30 ? "var(--primary)" : result.days_remaining > 7 ? "var(--warning)" : "var(--danger)" }}>
                {result.days_remaining}
              </div>
              <div style={{ fontSize: 10, color: "var(--text2)" }}>DAYS LEFT</div>
            </div>
          </div>

          {/* Cert details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              ["Issuer",       result.issuer],
              ["Subject",      result.subject],
              ["TLS Version",  result.tls_version],
              ["Cipher Suite", result.cipher],
              ["Key Bits",     result.bits ? `${result.bits}-bit` : "N/A"],
              ["Issued",       result.issued  ? new Date(result.issued).toLocaleDateString()  : "N/A"],
              ["Expires",      result.expires ? new Date(result.expires).toLocaleDateString() : "N/A"],
              ["DNSSEC",       result.dnssec || "N/A"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "9px 13px" }}>
                <div style={{ fontSize: 9.5, color: "var(--text2)", marginBottom: 3 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: "var(--white)", fontFamily: "'JetBrains Mono',monospace", wordBreak: "break-all" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Security checks */}
          <div className="section-label">SECURITY CHECKS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 16 }}>
            <Check ok={result.valid}       label="Certificate is valid and not expired" />
            <Check ok={!result.self_signed}label="Certificate is CA-signed (not self-signed)" />
            <Check ok={result.hsts}        label="HSTS header enabled" />
            <Check ok={result.tls_version === "TLSv1.3" || result.tls_version === "TLSv1.2"} label="Modern TLS version (1.2 or 1.3)" />
            <Check ok={result.tls_version !== "TLSv1" && result.tls_version !== "TLSv1.1"} label="Legacy TLS 1.0/1.1 not used" />
            <Check ok={result.days_remaining > 30} label="Certificate not expiring soon (>30 days)" />
          </div>

          {/* SANs */}
          {result.san?.length > 0 && (
            <div>
              <div className="section-label">SUBJECT ALTERNATIVE NAMES ({result.san.length})</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {result.san.slice(0, 20).map((s, i) => <span key={i} className="tag c" style={{ fontSize: 9.5 }}>{s}</span>)}
                {result.san.length > 20 && <span className="tag g">+{result.san.length - 20} more</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {result?.error && (
        <div className="alert error">
          ⚠ {result.error.includes("timeout") ? "Connection timed out — domain may not support HTTPS or is unreachable." : result.error}
        </div>
      )}
    </div>
  );
}
