import { useState } from "react";
import { AlertTriangle, CheckCircle, Shield, Eye, EyeOff } from "lucide-react";

export default function BreachMonitor() {
  const [email, setEmail]       = useState("");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const check = async () => {
    if (!email.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/p2/breach", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setResult(await r.json());
    } catch (e) { setResult({ error: e.message }); }
    setLoading(false);
  };

  const maskEmail = (e) => {
    const [user, domain] = e.split("@");
    return user.slice(0, 2) + "****@" + domain;
  };

  const severityColor = (count) =>
    count >= 5 ? "var(--danger)" : count >= 2 ? "var(--warning)" : "var(--cyan)";

  const formatCount = (n) =>
    n >= 1e9 ? (n/1e9).toFixed(1)+"B" : n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(0)+"K" : n;

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>
          Dark Web Breach Monitor
        </h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>
          &gt; Check if your email has appeared in known data breaches via HaveIBeenPwned
        </p>
      </div>

      <div className="alert warn" style={{ marginBottom: 18 }}>
        ⚠ DEMO MODE — Add <code style={{ color: "var(--primary)" }}>HIBP_API_KEY</code> to <code style={{ color: "var(--primary)" }}>backend/.env</code> for real breach checking.
        Get a key at <a href="https://haveibeenpwned.com/API/Key" target="_blank" rel="noreferrer" style={{ color: "var(--cyan)" }}>haveibeenpwned.com</a> (~$3.50/month).
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div className="section-label">EMAIL ADDRESS</div>
        <div style={{ display: "flex", gap: 9 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input className="input" type={showEmail ? "text" : "password"}
              placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && check()}
              style={{ paddingRight: 42 }} />
            <button onClick={() => setShowEmail(v => !v)}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text2)", cursor: "pointer", display: "flex" }}>
              {showEmail ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          <button className="btn solid" onClick={check} disabled={loading || !email.trim()}>
            {loading ? <span className="spinner spin"/> : <><Shield size={13}/> Check</>}
          </button>
        </div>
        <div style={{ marginTop: 8, fontSize: 10.5, color: "var(--text2)" }}>
          🔒 Your email is sent only to our backend — never stored or logged.
        </div>
      </div>

      {result && !result.error && (
        <div className="card fade-up" style={{ padding: 22 }}>
          {/* Overall verdict */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
            {result.breached
              ? <AlertTriangle size={36} color="var(--danger)" />
              : <CheckCircle   size={36} color="var(--primary)" />}
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, color: result.breached ? "var(--danger)" : "var(--primary)" }}>
                {result.breached ? "PWNED — Account Found in Breaches" : "GOOD NEWS — No Breaches Found"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
                {result.breached
                  ? `${result.breach_count} breach${result.breach_count !== 1 ? "es" : ""} · ${result.pastes} paste${result.pastes !== 1 ? "s" : ""}`
                  : "This email was not found in any known data breaches."}
                {" "}— <span style={{ color: "var(--text)" }}>{showEmail ? result.email : maskEmail(result.email || email)}</span>
              </div>
            </div>
            {result.demo && <span className="tag w" style={{ marginLeft: "auto" }}>DEMO DATA</span>}
          </div>

          {/* Breach count summary */}
          {result.breached && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { l: "Breaches",    v: result.breach_count, color: severityColor(result.breach_count) },
                { l: "Pastes",      v: result.pastes,       color: result.pastes > 0 ? "var(--warning)" : "var(--primary)" },
                { l: "Risk Level",  v: result.breach_count >= 5 ? "CRITICAL" : result.breach_count >= 2 ? "HIGH" : "MEDIUM", color: severityColor(result.breach_count) },
              ].map((s, i) => (
                <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, color: s.color }}>{s.v}</div>
                  <div style={{ fontSize: 9.5, color: "var(--text2)", marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          )}

          {/* Breach list */}
          {result.breaches?.length > 0 && (
            <div>
              <div className="section-label">BREACHES FOUND</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {result.breaches.map((b, i) => (
                  <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--danger)22", borderLeft: "2px solid var(--danger)", padding: "13px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 13.5, color: "var(--white)", fontWeight: 600, marginBottom: 2 }}>{b.name}</div>
                        <div style={{ fontSize: 10.5, color: "var(--text2)" }}>
                          Breach date: <span style={{ color: "var(--text)" }}>{b.date || "Unknown"}</span>
                          {" · "}{formatCount(b.pwn_count)} accounts affected
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {b.data_classes?.slice(0, 4).map((dc, j) => (
                          <span key={j} className="tag d" style={{ fontSize: 8.5 }}>{dc}</span>
                        ))}
                      </div>
                    </div>
                    {b.description && (
                      <div style={{ fontSize: 11, color: "var(--text2)", lineHeight: 1.6 }}>{b.description}...</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What to do */}
          {result.breached && (
            <div style={{ marginTop: 18 }}>
              <div className="section-label">RECOMMENDED ACTIONS</div>
              {[
                "Change passwords on all affected accounts immediately",
                "Enable two-factor authentication (2FA) on all accounts",
                "Check if you reused passwords on other sites and change those too",
                "Use a password manager to generate unique passwords for each site",
                "Monitor your accounts for suspicious login activity",
              ].map((rec, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 11.5, color: "var(--text)", marginBottom: 6 }}>
                  <span style={{ color: "var(--primary)", flexShrink: 0 }}>→</span>{rec}
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
