import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Database, Activity, Zap, ChevronRight } from "lucide-react";

const QUICK_TOOLS = [
  // Phase 1
  { id: "phishing",   emoji: "🛡",  label: "Phishing Detection",  color: "var(--primary)", phase: 1 },
  { id: "chat",       emoji: "🤖",  label: "AI Chat",             color: "var(--cyan)",    phase: 1 },
  { id: "email",      emoji: "📧",  label: "Email Analyzer",      color: "var(--primary)", phase: 1 },
  { id: "cve",        emoji: "🔍",  label: "CVE Lookup",          color: "var(--cyan)",    phase: 1 },
  { id: "password",   emoji: "🔑",  label: "Password Tools",      color: "var(--warning)", phase: 1 },
  { id: "webrtc",     emoji: "📡",  label: "WebRTC Leak Test",    color: "var(--danger)",  phase: 1 },
  { id: "malware",    emoji: "💻",  label: "Malware Detection",   color: "var(--danger)",  phase: 1 },
  { id: "threats",    emoji: "⚡",  label: "Threat Intel Feed",   color: "var(--warning)", phase: 1 },
  // Phase 2
  { id: "virustotal", emoji: "🦠",  label: "VirusTotal Scanner",  color: "var(--cyan)",    phase: 2 },
  { id: "dns",        emoji: "🌐",  label: "DNS & WHOIS",         color: "var(--cyan)",    phase: 2 },
  { id: "ssl",        emoji: "🔒",  label: "SSL/TLS Analyzer",    color: "var(--primary)", phase: 2 },
  { id: "subdomains", emoji: "🕵️",  label: "Subdomain Enum",      color: "var(--warning)", phase: 2 },
  { id: "breach",     emoji: "🌑",  label: "Breach Monitor",      color: "var(--danger)",  phase: 2 },
  { id: "workspace",  emoji: "🗂",  label: "Workspace & History", color: "var(--text2)",   phase: 2 },
];

export default function Overview({ onNavigate }) {
  const [stats, setStats]   = useState({ threatsBlocked: 284512, scansToday: 12400, cveDatabase: 247891 });
  const [phaseTab, setPhaseTab] = useState(1);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {});
    const id = setInterval(() => {
      setStats(s => ({ ...s, threatsBlocked: s.threatsBlocked + Math.floor(Math.random() * 3) }));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const metrics = [
    { l: "Threats Blocked", v: stats.threatsBlocked.toLocaleString(), color: "var(--danger)",  icon: <Shield size={15}/>,   sub: "↑ +1,247 from yesterday" },
    { l: "CVE Database",    v: stats.cveDatabase.toLocaleString(),    color: "var(--cyan)",    icon: <Database size={15}/>, sub: "247K vulnerabilities indexed" },
    { l: "Scans Today",     v: stats.scansToday.toLocaleString(),     color: "var(--primary)", icon: <Activity size={15}/>, sub: "Real-time AI analysis" },
    { l: "Platform Uptime", v: "99.97%",                              color: "var(--warning)", icon: <Zap size={15}/>,      sub: "Last 30 days" },
  ];

  const recentAlerts = [
    { s: "critical", m: "CVE-2024-3094 exploitation attempt detected",      t: "2m ago" },
    { s: "high",     m: "Phishing domain registered: paypa1-secure.com",    t: "8m ago" },
    { s: "high",     m: "Suspicious SSH brute force: 185.220.101.45",       t: "15m ago" },
    { s: "medium",   m: "Deepfake audio detected in customer support call",  t: "31m ago" },
    { s: "medium",   m: "WebRTC IP leak detected on corporate browser",      t: "1h ago" },
    { s: "low",      m: "Outdated TLS 1.0 detected on legacy endpoint",     t: "2h ago" },
  ];

  const attackVectors = [
    ["Phishing / Social Engineering",     74, "var(--danger)"],
    ["Malware / Ransomware",              68, "var(--warning)"],
    ["Brute Force / Credential Stuffing", 61, "var(--primary)"],
    ["SQL Injection / XSS",               45, "var(--primary)"],
    ["Supply Chain Attacks",              38, "var(--cyan)"],
    ["Deepfake / Synthetic Media",        29, "var(--cyan)"],
  ];

  const sc = { critical: "var(--danger)", high: "#ff6600", medium: "var(--warning)", low: "var(--cyan)" };

  const visibleTools = QUICK_TOOLS.filter(t => t.phase === phaseTab);

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 21, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>
          Security Operations Center
        </h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>
          &gt; Real-time threat posture &amp; intelligence dashboard<span className="cursor">_</span>
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 14, marginBottom: 22 }}>
        {metrics.map((m, i) => (
          <div key={i} className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div className="section-label" style={{ marginBottom: 0 }}>{m.l}</div>
              <span style={{ color: m.color }}>{m.icon}</span>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 26, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.v}</div>
            <div style={{ fontSize: 10, color: "var(--text2)" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Alerts + Vectors */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <div className="card" style={{ padding: "18px" }}>
          <div className="section-label">RECENT SECURITY ALERTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentAlerts.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: sc[a.s], marginTop: 4.5, flexShrink: 0, boxShadow: `0 0 5px ${sc[a.s]}` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, color: "var(--text)", marginBottom: 1 }}>{a.m}</div>
                  <div style={{ fontSize: 10, color: "var(--text2)" }}>{a.t}</div>
                </div>
                <span className={`tag ${a.s === "critical" || a.s === "high" ? "d" : a.s === "medium" ? "w" : "c"}`} style={{ fontSize: 8.5, flexShrink: 0 }}>
                  {a.s.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div className="section-label">TOP ATTACK VECTORS (30 DAYS)</div>
          {attackVectors.map(([name, pct, color], i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11.5 }}>
                <span style={{ color: "var(--text)" }}>{name}</span>
                <span style={{ color: "var(--text2)" }}>{pct}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}55`, animationDelay: `${i * .1}s` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access — Phase tabs */}
      <div className="card" style={{ padding: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 0 }}>QUICK ACCESS — ALL TOOLS</div>
            <div style={{ fontSize: 10, color: "var(--text2)", marginTop: 3 }}>Click any tool to launch instantly</div>
          </div>
          {/* Phase toggle */}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setPhaseTab(1)}
              style={{ padding: "5px 14px", fontSize: 10.5, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, border: "1px solid", transition: "all .18s",
                background: phaseTab === 1 ? "var(--primary-dim)" : "transparent",
                borderColor: phaseTab === 1 ? "var(--primary)" : "var(--border)",
                color: phaseTab === 1 ? "var(--primary)" : "var(--text2)" }}>
              Phase 1
            </button>
            <button
              onClick={() => setPhaseTab(2)}
              style={{ padding: "5px 14px", fontSize: 10.5, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, border: "1px solid", transition: "all .18s",
                background: phaseTab === 2 ? "var(--cyan-dim)" : "transparent",
                borderColor: phaseTab === 2 ? "var(--cyan)" : "var(--border)",
                color: phaseTab === 2 ? "var(--cyan)" : "var(--text2)" }}>
              Phase 2 ✦ NEW
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px,1fr))", gap: 9 }}>
          {visibleTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => onNavigate && onNavigate(tool.id)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", padding: "10px 13px", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: "var(--text)", transition: "all .18s", textAlign: "left", width: "100%" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = tool.color; e.currentTarget.style.color = tool.color; e.currentTarget.style.background = "var(--card2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface)"; }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>{tool.emoji}</span>
                {tool.label}
              </span>
              <ChevronRight size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
