import { useState, useEffect, useCallback } from "react";
import { Globe, AlertTriangle, Shield, RefreshCw, ExternalLink, Bell, BellOff, Zap, Clock } from "lucide-react";
import api from "../services/api.js";

const SEV_COLOR = { critical: "#ff3b5c", high: "#ff8c00", medium: "#ffd700", low: "#00e87a" };
const SEV_BG    = { critical: "rgba(255,59,92,.1)", high: "rgba(255,140,0,.1)", medium: "rgba(255,215,0,.08)", low: "rgba(0,232,122,.08)" };

function SeverityBadge({ severity }) {
  const s = (severity || "medium").toLowerCase();
  return (
    <span style={{ background: SEV_BG[s] || SEV_BG.medium, color: SEV_COLOR[s] || SEV_COLOR.medium, border: `1px solid ${SEV_COLOR[s] || SEV_COLOR.medium}44`, fontSize: 10, fontWeight: 700, padding: "3px 9px", letterSpacing: ".1em", textTransform: "uppercase" }}>
      {s}
    </span>
  );
}

function IncidentCard({ incident, expanded, onToggle }) {
  const color = SEV_COLOR[(incident.severity || "medium").toLowerCase()] || SEV_COLOR.medium;
  return (
    <div onClick={onToggle} style={{ border: `1px solid ${color}33`, background: expanded ? `${color}06` : "var(--surface)", marginBottom: 10, cursor: "pointer", transition: "all .2s" }}
      onMouseEnter={e => !expanded && (e.currentTarget.style.borderColor = `${color}66`)}
      onMouseLeave={e => !expanded && (e.currentTarget.style.borderColor = `${color}33`)}>

      {/* Header */}
      <div style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0, marginTop: 5 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 13.5, fontWeight: 700, color: "var(--white)", lineHeight: 1.4 }}>{incident.title}</div>
            <SeverityBadge severity={incident.severity} />
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--text2)" }}>🌐 {incident.region || "Global"}</span>
            <span style={{ fontSize: 11, color: "var(--text2)" }}>📁 {incident.category || "Cyber Incident"}</span>
            <span style={{ fontSize: 11, color: "var(--text2)" }}>🔗 {incident.source}</span>
            {incident.dateAdded && <span style={{ fontSize: 11, color: "var(--text2)" }}>📅 {incident.dateAdded}</span>}
            {incident.cvssScore && <span style={{ fontSize: 11, color: color, fontWeight: 700 }}>CVSS {incident.cvssScore}</span>}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${color}22`, padding: "16px" }}>
          <p style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.85, marginBottom: 14 }}>{incident.description}</p>

          {incident.cves?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: "var(--text2)", letterSpacing: ".1em", marginBottom: 6 }}>CVES</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {incident.cves.map(c => (
                  <a key={c} href={`https://nvd.nist.gov/vuln/detail/${c}`} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ background: "var(--bg)", border: "1px solid rgba(255,59,92,.4)", color: "#ff3b5c", fontSize: 11, padding: "3px 9px", fontFamily: "monospace", textDecoration: "none" }}>
                    {c} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          {incident.affected && (
            <div style={{ marginBottom: 14, background: "var(--bg)", border: "1px solid var(--border)", padding: "10px 14px" }}>
              <div style={{ fontSize: 10, color: "var(--text2)", letterSpacing: ".1em", marginBottom: 4 }}>AFFECTED SYSTEMS</div>
              <div style={{ fontSize: 12.5, color: "var(--text)" }}>{incident.affected}</div>
            </div>
          )}

          {incident.steps?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: "var(--primary)", letterSpacing: ".1em", marginBottom: 10, fontWeight: 700 }}>🛡 RECOMMENDED PRECAUTION STEPS</div>
              {incident.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 12.5, color: "var(--text)", lineHeight: 1.7 }}>
                  <div style={{ width: 20, height: 20, background: color, color: "#01050a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  <div>{step}</div>
                </div>
              ))}
            </div>
          )}

          {incident.sourceUrl && (
            <a href={incident.sourceUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 11.5, color: "var(--cyan)", textDecoration: "none" }}>
              <ExternalLink size={12} /> View Full Advisory
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function LiveThreatFeed() {
  const [incidents, setIncidents]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expanded, setExpanded]     = useState(null);
  const [filter, setFilter]         = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alertSent, setAlertSent]   = useState(false);

  const fetchFeed = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/incidents/feed");
      setIncidents(res.data.incidents || []);
      setLastUpdated(new Date());
    } catch (e) {
      setError("Failed to load incident feed. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchFeed, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchFeed]);

  const filtered = filter === "all" ? incidents : incidents.filter(i => (i.severity || "").toLowerCase() === filter);
  const counts   = { critical: 0, high: 0, medium: 0, low: 0 };
  incidents.forEach(i => { const s = (i.severity || "medium").toLowerCase(); if (counts[s] !== undefined) counts[s]++; });

  const sendAlertToAll = async () => {
    if (!incidents.length) return;
    const topIncident = incidents.find(i => i.severity?.toLowerCase() === "critical") || incidents[0];
    try {
      await api.post("/incidents/alert", { incident: topIncident });
      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 4000);
    } catch (e) {
      alert("Alert failed: " + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Globe size={20} color="var(--primary)" />
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, color: "var(--white)", margin: 0 }}>
            Live Global Threat Feed
          </h1>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e87a", boxShadow: "0 0 8px #00e87a", animation: "pulse 2s infinite" }} />
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text)", margin: 0, lineHeight: 1.7 }}>
          Real-time cybersecurity incidents from CISA Known Exploited Vulnerabilities and NIST NVD. Auto-refreshes every 5 minutes. NexGuard members receive email alerts for critical incidents.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {Object.entries(counts).map(([sev, count]) => (
          <div key={sev} onClick={() => setFilter(filter === sev ? "all" : sev)}
            style={{ background: filter === sev ? SEV_BG[sev] : "var(--surface)", border: `1px solid ${filter === sev ? SEV_COLOR[sev] : "var(--border)"}`, padding: "14px", textAlign: "center", cursor: "pointer", transition: "all .2s" }}>
            <div style={{ fontSize: 22, fontFamily: "Syne, sans-serif", fontWeight: 800, color: SEV_COLOR[sev] }}>{count}</div>
            <div style={{ fontSize: 10, color: "var(--text2)", letterSpacing: ".1em", textTransform: "uppercase", marginTop: 2 }}>{sev}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["all","critical","high","medium"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? "var(--primary)" : "var(--surface)", color: filter === f ? "#01050a" : "var(--text2)", border: "1px solid var(--border)", fontSize: 11, padding: "6px 14px", cursor: "pointer", fontWeight: filter === f ? 700 : 400, textTransform: "capitalize" }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {lastUpdated && (
            <span style={{ fontSize: 10.5, color: "var(--text2)", display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={11} /> {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button onClick={() => setAutoRefresh(a => !a)}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: autoRefresh ? "var(--primary)" : "var(--text2)", padding: "6px 12px", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {autoRefresh ? <Bell size={12} /> : <BellOff size={12} />} Auto
          </button>
          <button onClick={fetchFeed} disabled={loading}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text2)", padding: "6px 12px", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
          </button>
          <button onClick={sendAlertToAll}
            style={{ background: alertSent ? "var(--primary)" : "rgba(255,59,92,.15)", border: "1px solid rgba(255,59,92,.4)", color: alertSent ? "#01050a" : "#ff3b5c", padding: "6px 14px", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
            <Zap size={12} /> {alertSent ? "Alert Sent!" : "Alert All Users"}
          </button>
        </div>
      </div>

      {/* Sources */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["CISA KEV — Active Exploits","NIST NVD — Critical CVEs"].map((s, i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "5px 12px", fontSize: 10.5, color: "var(--text2)", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} /> {s}
          </div>
        ))}
      </div>

      {/* Feed */}
      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>
          <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", marginBottom: 12 }} />
          <div style={{ fontSize: 13 }}>Fetching live threat intelligence...</div>
        </div>
      )}

      {error && !loading && (
        <div style={{ background: "rgba(255,59,92,.08)", border: "1px solid rgba(255,59,92,.3)", padding: "16px 20px", color: "#ff3b5c", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>
          <Shield size={32} style={{ marginBottom: 12, opacity: .4 }} />
          <div>No {filter !== "all" ? filter : ""} incidents found</div>
        </div>
      )}

      {!loading && filtered.map((incident, i) => (
        <IncidentCard key={incident.id || i} incident={incident}
          expanded={expanded === i} onToggle={() => setExpanded(expanded === i ? null : i)} />
      ))}

      {/* Footer note */}
      {!loading && incidents.length > 0 && (
        <div style={{ fontSize: 11, color: "var(--text2)", textAlign: "center", marginTop: 16, padding: "12px", borderTop: "1px solid var(--border)", lineHeight: 1.8 }}>
          🔔 NexGuard members automatically receive email alerts for critical incidents · Sources: CISA, NIST NVD · Updates every 5 min
        </div>
      )}
    </div>
  );
}
