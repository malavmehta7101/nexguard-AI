import { useState } from "react";
import { Search, ExternalLink, RefreshCw } from "lucide-react";

export default function SubdomainEnum() {
  const [domain, setDomain]     = useState("");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState("");
  const [showWild, setShowWild] = useState(true);

  const enumerate = async () => {
    if (!domain.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/p2/subdomains", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      setResult(await r.json());
    } catch (e) { setResult({ error: e.message }); }
    setLoading(false);
  };

  const filtered = result?.subdomains?.filter(s => {
    const matchFilter = !filter || s.subdomain.includes(filter.toLowerCase());
    const matchWild   = showWild || !s.wildcard;
    return matchFilter && matchWild;
  }) || [];

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>
          Subdomain Enumeration
        </h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>
          &gt; Discover subdomains using certificate transparency logs (crt.sh) — no API key required
        </p>
      </div>

      <div className="alert info" style={{ marginBottom: 18 }}>
        ◈ Data sourced from <strong style={{ color: "var(--white)" }}>crt.sh</strong> — public certificate transparency logs. 100% free, no API key needed.
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div className="section-label">TARGET DOMAIN</div>
        <div style={{ display: "flex", gap: 9 }}>
          <input className="input" style={{ flex: 1 }} placeholder="humber.ca"
            value={domain} onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === "Enter" && enumerate()} />
          <button className="btn solid" onClick={enumerate} disabled={loading || !domain.trim()}>
            {loading ? <><span className="spinner spin"/> Scanning...</> : <><Search size={13}/> Enumerate</>}
          </button>
        </div>
        {loading && (
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--text2)" }}>
            ⏳ Querying certificate transparency logs — this may take 10–20 seconds...
          </div>
        )}
      </div>

      {result && !result.error && (
        <div className="card fade-up" style={{ padding: 22 }}>
          {/* Header stats */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 800, color: "var(--cyan)" }}>{result.domain}</div>
              <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 3 }}>
                Source: {result.source} · {new Date(result.queried_at).toLocaleTimeString()}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: 26, fontWeight: 800, color: "var(--primary)" }}>{result.total}</div>
                <div style={{ fontSize: 9.5, color: "var(--text2)" }}>TOTAL FOUND</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: 26, fontWeight: 800, color: "var(--cyan)" }}>{filtered.length}</div>
                <div style={{ fontSize: 9.5, color: "var(--text2)" }}>SHOWING</div>
              </div>
            </div>
          </div>

          {/* Filter row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <input className="input" placeholder="Filter subdomains..." value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ flex: 1, minWidth: 180 }} />
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--text)", cursor: "pointer", background: "var(--card)", border: "1px solid var(--border)", padding: "0 12px" }}>
              <input type="checkbox" checked={showWild} onChange={e => setShowWild(e.target.checked)}
                style={{ accentColor: "var(--primary)", cursor: "pointer" }} />
              Show wildcards
            </label>
          </div>

          {/* Subdomain list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 440, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: "var(--text2)", fontSize: 12 }}>
                No subdomains match your filter.
              </div>
            ) : filtered.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px", background: "var(--surface)", border: "1px solid var(--border)", gap: 10, transition: "border-color .18s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,212,255,.3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: "var(--primary)", fontFamily: "'JetBrains Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.subdomain}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  {s.wildcard && <span className="tag w" style={{ fontSize: 8 }}>WILDCARD</span>}
                  {s.issuer   && <span className="tag c" style={{ fontSize: 8 }}>{s.issuer.slice(0,18)}</span>}
                  <a href={`https://${s.subdomain}`} target="_blank" rel="noreferrer"
                    style={{ color: "var(--text2)", display: "flex" }}
                    onClick={e => e.stopPropagation()}>
                    <ExternalLink size={12}/>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {result.total > 100 && (
            <div className="alert info" style={{ marginTop: 12 }}>
              ◈ Showing first 100 of {result.total} results. Use the filter to narrow results.
            </div>
          )}
        </div>
      )}

      {result?.error && (
        <div className="alert error">
          ⚠ {result.error.includes("timeout") ? "Query timed out — try again or use a smaller domain." : result.error}
        </div>
      )}
    </div>
  );
}
