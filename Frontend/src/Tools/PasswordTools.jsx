import { useState } from "react";
import { Key, RefreshCw, Hash } from "lucide-react";

function PasswordAnalyzer() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async (val) => {
    setPassword(val);
    if (!val) { setResult(null); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/ai/password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: val }),
      });
      setResult(await r.json());
    } catch { setResult(null); }
    setLoading(false);
  };

  const strengthColor = { WEAK: "var(--danger)", MODERATE: "var(--warning)", STRONG: "var(--primary)", EXCELLENT: "var(--cyan)" };
  const sc = result ? (strengthColor[result.strength] || "var(--text2)") : "var(--text2)";

  return (
    <div>
      <div className="section-label">ENTER PASSWORD TO ANALYZE</div>
      <div style={{ position: "relative", marginBottom: 18 }}>
        <input className="input" type="text" placeholder="Type or paste your password..." value={password} onChange={e => analyze(e.target.value)} style={{ paddingRight: 90 }} />
        {loading && <span className="spinner spin" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} />}
      </div>

      {result && !result.error && (
        <div>
          {/* Strength */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 26, fontWeight: 800, color: sc }}>{result.strength}</div>
            <div>
              <div style={{ fontSize: 11.5, color: "var(--text2)" }}>Score: {result.score}/{result.maxScore} · Entropy: <b style={{ color: sc }}>{result.entropy} bits</b></div>
              <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>Est. crack time: <b style={{ color: sc }}>{result.crackTime}</b></div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 18 }}>
            <div className="progress-track" style={{ height: 5 }}>
              <div className="progress-fill" style={{ width: `${(result.score / result.maxScore) * 100}%`, background: sc, height: "100%" }} />
            </div>
          </div>

          {/* Criteria */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["length",   "Minimum 12 characters"],
              ["longLength","16+ characters (ideal)"],
              ["uppercase","Uppercase letters (A-Z)"],
              ["lowercase","Lowercase letters (a-z)"],
              ["numbers",  "Numbers (0-9)"],
              ["symbols",  "Special symbols (!@#$...)"],
              ["noCommon", "Not a common password"],
              ["noRepeat", "No repeated characters"],
            ].map(([k, label]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
                <span style={{ color: result.checks[k] ? "var(--primary)" : "var(--danger)", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {result.checks[k] ? "✓" : "✗"}
                </span>
                <span style={{ color: result.checks[k] ? "var(--text)" : "var(--text2)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordGenerator() {
  const [opts, setOpts] = useState({ length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/tools/generate-password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(opts),
      });
      const data = await r.json();
      setPassword(data.password);
      setCopied(false);
    } catch { }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(password).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div>
      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          ["uppercase","Uppercase (A-Z)"],["lowercase","Lowercase (a-z)"],
          ["numbers","Numbers (0-9)"],["symbols","Symbols (!@#$)"],
        ].map(([k, label]) => (
          <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: "var(--text)" }}>
            <input type="checkbox" checked={opts[k]} onChange={e => setOpts(o => ({ ...o, [k]: e.target.checked }))}
              style={{ accentColor: "var(--primary)", width: 14, height: 14, cursor: "pointer" }} />
            {label}
          </label>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text2)", marginBottom: 6 }}>
          <span>LENGTH</span><b style={{ color: "var(--primary)" }}>{opts.length} characters</b>
        </div>
        <input type="range" min={8} max={64} value={opts.length} onChange={e => setOpts(o => ({ ...o, length: +e.target.value }))} style={{ width: "100%", accentColor: "var(--primary)" }} />
      </div>

      <button className="btn solid" onClick={generate} disabled={loading} style={{ width: "100%", marginBottom: 14 }}>
        {loading ? <span className="spinner spin" /> : <><RefreshCw size={13} /> Generate Secure Password</>}
      </button>

      {password && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "13px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <code style={{ flex: 1, fontSize: 13, color: "var(--primary)", wordBreak: "break-all", lineHeight: 1.6 }}>{password}</code>
          <button className="btn sm" onClick={copy} style={{ flexShrink: 0 }}>{copied ? "✓ Copied" : "Copy"}</button>
        </div>
      )}
    </div>
  );
}

function HashIdentifier() {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const identify = async () => {
    if (!hash.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/ai/hash", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hash: hash.trim() }),
      });
      setResult(await r.json());
    } catch (e) { setResult({ algorithm: "ERROR", analysis: e.message }); }
    setLoading(false);
  };

  const samples = [
    ["MD5", "5f4dcc3b5aa765d61d8327deb882cf99"],
    ["SHA-256", "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"],
    ["bcrypt", "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"],
  ];

  return (
    <div>
      <div className="section-label">HASH STRING</div>
      <div style={{ display: "flex", gap: 9, marginBottom: 10 }}>
        <input className="input" placeholder="5f4dcc3b5aa765d61d8327deb882cf99" value={hash} onChange={e => setHash(e.target.value)} onKeyDown={e => e.key === "Enter" && identify()} style={{ flex: 1 }} />
        <button className="btn cyan" onClick={identify} disabled={loading || !hash.trim()}>
          {loading ? <span className="spinner spin" /> : "Identify"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {samples.map(([label, val]) => (
          <button key={label} onClick={() => setHash(val)} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--cyan)", fontSize: 10.5, padding: "4px 10px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
            {label}
          </button>
        ))}
      </div>

      {result && !result.error && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 16 }}>
          {result.algorithm && result.algorithm !== "UNKNOWN" && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 800, color: "var(--cyan)", marginBottom: 6 }}>{result.algorithm}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {result.length_bits && <span className="tag c">{result.length_bits} bits</span>}
                {result.crackable && <span className="tag d">Crackable</span>}
                {result.rainbow_table_risk && <span className="tag w">Rainbow Table Risk</span>}
                <span style={{ fontSize: 11, color: "var(--text2)" }}>Confidence: {result.confidence}%</span>
              </div>
            </div>
          )}
          {result.analysis && <div className="result-box" style={{ marginTop: 0 }}>{result.analysis}</div>}
        </div>
      )}
    </div>
  );
}

export default function PasswordTools() {
  const [tab, setTab] = useState("analyze");

  const tabs = [
    { id: "analyze",   icon: <Key size={13} />,     label: "Password Analyzer" },
    { id: "generate",  icon: <RefreshCw size={13} />,label: "Password Generator" },
    { id: "hash",      icon: <Hash size={13} />,    label: "Hash Identifier" },
  ];

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>Advanced Password Security Tools</h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; Entropy analysis, secure generation, and hash identification</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {tabs.map(t => (
          <button key={t.id} className={`tool-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 22 }}>
        {tab === "analyze"  && <PasswordAnalyzer />}
        {tab === "generate" && <PasswordGenerator />}
        {tab === "hash"     && <HashIdentifier />}
      </div>
    </div>
  );
}
