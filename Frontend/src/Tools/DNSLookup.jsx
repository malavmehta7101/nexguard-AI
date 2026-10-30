import { useState } from "react";
import { Globe, Search, Server } from "lucide-react";

export default function DNSLookup() {
  const [mode, setMode]       = useState("dns");
  const [domain, setDomain]   = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    if (!domain.trim()) return;
    setLoading(true); setResult(null);
    try {
      const endpoint = mode === "dns" ? "/api/p2/dns" : "/api/p2/whois";
      const r = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      setResult(await r.json());
    } catch (e) { setResult({ error: e.message }); }
    setLoading(false);
  };

  const RecordBadge = ({ label, values }) => {
    if (!values || (Array.isArray(values) && values.length === 0)) return null;
    const list = Array.isArray(values) ? values : [values];
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9.5, color: "var(--text2)", letterSpacing: ".1em", marginBottom: 6 }}>{label} RECORDS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {list.map((v, i) => (
            <div key={i} style={{ padding: "7px 12px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12, color: "var(--primary)", fontFamily: "'JetBrains Mono', monospace" }}>
              {typeof v === "object" ? JSON.stringify(v) : String(v)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>DNS Lookup &amp; WHOIS</h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; Query DNS records (A, MX, TXT, NS, CNAME) and full WHOIS domain registration data</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button className={`tool-tab${mode === "dns" ? " active" : ""}`} onClick={() => { setMode("dns"); setResult(null); }}><Server size={13}/> DNS Records</button>
        <button className={`tool-tab${mode === "whois" ? " active" : ""}`} onClick={() => { setMode("whois"); setResult(null); }}><Search size={13}/> WHOIS Lookup</button>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div className="section-label">DOMAIN NAME</div>
        <div style={{ display: "flex", gap: 9 }}>
          <input className="input" style={{ flex: 1 }} placeholder="example.com" value={domain}
            onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === "Enter" && lookup()} />
          <button className="btn solid" onClick={lookup} disabled={loading || !domain.trim()}>
            {loading ? <span className="spinner spin"/> : <><Globe size={13}/> Lookup</>}
          </button>
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["google.com","github.com","humber.ca","cloudflare.com"].map(d => (
            <button key={d} onClick={() => setDomain(d)} style={{ background: "none", border: "none", color: "var(--cyan)", fontSize: 10.5, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", textDecoration: "underline" }}>{d}</button>
          ))}
        </div>
      </div>

      {result && !result.error && mode === "dns" && (
        <div className="card fade-up" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 800, color: "var(--cyan)" }}>{result.domain}</div>
            <div style={{ display: "flex", gap: 7 }}>
              <span className="tag c">DNS RECORDS</span>
              <span style={{ fontSize: 10, color: "var(--text2)" }}>{new Date(result.queried_at).toLocaleTimeString()}</span>
            </div>
          </div>

          {result.reverse_dns && (
            <div className="alert info" style={{ marginBottom: 16 }}>
              ◈ Reverse DNS: <strong style={{ color: "var(--white)" }}>{result.reverse_dns}</strong>
            </div>
          )}

          <RecordBadge label="A (IPv4)"   values={result.records?.A} />
          <RecordBadge label="AAAA (IPv6)" values={result.records?.AAAA} />
          <RecordBadge label="MX (Mail)"  values={result.records?.MX?.map(m => `Priority ${m.priority}: ${m.exchange}`)} />
          <RecordBadge label="NS (Nameserver)" values={result.records?.NS} />
          <RecordBadge label="TXT"        values={result.records?.TXT} />
          <RecordBadge label="CNAME"      values={result.records?.CNAME} />
          {result.records?.SOA && <RecordBadge label="SOA" values={[`${result.records.SOA.nsname} (serial: ${result.records.SOA.serial})`]} />}
        </div>
      )}

      {result && !result.error && mode === "whois" && (
        <div className="card fade-up" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 800, color: "var(--cyan)" }}>{result.domain}</div>
            <span className="tag c">WHOIS — RDAP</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              ["Registrar",   result.registrar],
              ["Registrant",  result.registrant],
              ["Registered",  result.registered ? new Date(result.registered).toLocaleDateString() : "N/A"],
              ["Last Updated",result.updated    ? new Date(result.updated).toLocaleDateString()    : "N/A"],
              ["Expires",     result.expires    ? new Date(result.expires).toLocaleDateString()    : "N/A"],
              ["DNSSEC",      result.dnssec],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "10px 14px" }}>
                <div style={{ fontSize: 9.5, color: "var(--text2)", marginBottom: 4 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize: 12.5, color: "var(--white)", fontFamily: "'JetBrains Mono',monospace" }}>{v || "N/A"}</div>
              </div>
            ))}
          </div>

          {result.status?.length > 0 && (
            <div>
              <div className="section-label">DOMAIN STATUS</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {result.status.map((s, i) => <span key={i} className="tag g" style={{ fontSize: 9 }}>{s}</span>)}
              </div>
            </div>
          )}

          {result.nameservers?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="section-label">NAMESERVERS</div>
              {result.nameservers.map((ns, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--primary)", fontFamily: "'JetBrains Mono',monospace", padding: "3px 0" }}>{ns}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {result?.error && <div className="alert error">⚠ {result.error}</div>}
    </div>
  );
}
