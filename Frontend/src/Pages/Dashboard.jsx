import { useState } from "react";
import { Shield, Terminal, AlertTriangle, Database, Mail, Eye, Key, Network, Bug, Cpu, Activity, Globe, Menu, Home, ChevronRight, Search, Lock, Layers, Radio, Moon, Clock } from "lucide-react";
import ThreatTicker    from "../components/ThreatTicker.jsx";

// Phase 1 tools
import AIChat           from "../tools/AIChat.jsx";
import PhishingDetector from "../tools/PhishingDetector.jsx";
import DeepfakeAnalyzer from "../tools/DeepfakeAnalyzer.jsx";
import EmailAnalyzer    from "../tools/EmailAnalyzer.jsx";
import WebRTCChecker    from "../tools/WebRTCChecker.jsx";
import PasswordTools    from "../tools/PasswordTools.jsx";
import PenTesting       from "../tools/PenTesting.jsx";
import MalwareDetector  from "../tools/MalwareDetector.jsx";
import CVELookup        from "../tools/CVELookup.jsx";
import ThreatIntel      from "../tools/ThreatIntel.jsx";
import Overview         from "../tools/Overview.jsx";
import IPReputation     from "../tools/IPReputation.jsx";

// Phase 2 tools
import VirusTotalScanner from "../tools/VirusTotalScanner.jsx";
import DNSLookup         from "../tools/DNSLookup.jsx";
import SSLAnalyzer       from "../tools/SSLAnalyzer.jsx";
import SubdomainEnum     from "../tools/SubdomainEnum.jsx";
import BreachMonitor     from "../tools/BreachMonitor.jsx";
import WorkspaceHistory  from "../tools/WorkspaceHistory.jsx";
import LiveThreatFeed    from "../tools/LiveThreatFeed.jsx";

const NAV = [
  // Dashboard
  { id: "overview",   icon: <Activity size={15}/>,      label: "Overview",              group: "DASHBOARD" },
  { id: "workspace",  icon: <Clock size={15}/>,         label: "Workspace & History",   group: "DASHBOARD" },

  // Phase 1 — AI Tools
  { id: "chat",       icon: <Terminal size={15}/>,      label: "AI Chat Assistant",     group: "AI TOOLS" },
  { id: "phishing",   icon: <Shield size={15}/>,        label: "Phishing Detection",    group: "AI TOOLS" },
  { id: "deepfake",   icon: <Eye size={15}/>,           label: "Deepfake Analyzer",     group: "AI TOOLS" },
  { id: "email",      icon: <Mail size={15}/>,          label: "Email Analyzer",        group: "AI TOOLS" },
  { id: "malware",    icon: <Cpu size={15}/>,           label: "Malware Detection",     group: "AI TOOLS" },
  { id: "pentest",    icon: <Bug size={15}/>,           label: "Pen Testing Guide",     group: "AI TOOLS" },

  // Phase 1 — Security Tools
  { id: "webrtc",     icon: <Network size={15}/>,       label: "WebRTC Leak Test",      group: "SECURITY TOOLS" },
  { id: "password",   icon: <Key size={15}/>,           label: "Password Tools",        group: "SECURITY TOOLS" },
  { id: "cve",        icon: <Database size={15}/>,      label: "CVE Intelligence",      group: "SECURITY TOOLS" },
  { id: "threats",    icon: <AlertTriangle size={15}/>, label: "Threat Intel Feed",     group: "SECURITY TOOLS" },
  { id: "ip",         icon: <Globe size={15}/>,         label: "IP Reputation",         group: "SECURITY TOOLS" },

  // Phase 2 — Advanced Tools
  { id: "virustotal", icon: <Shield size={15}/>,        label: "VirusTotal Scanner",    group: "PHASE 2 — ADVANCED", badge: "NEW" },
  { id: "dns",        icon: <Search size={15}/>,        label: "DNS & WHOIS Lookup",    group: "PHASE 2 — ADVANCED", badge: "NEW" },
  { id: "ssl",        icon: <Lock size={15}/>,          label: "SSL/TLS Analyzer",      group: "PHASE 2 — ADVANCED", badge: "NEW" },
  { id: "subdomains", icon: <Layers size={15}/>,        label: "Subdomain Enum",        group: "PHASE 2 — ADVANCED", badge: "NEW" },
  { id: "breach",     icon: <Moon size={15}/>,          label: "Breach Monitor",        group: "PHASE 2 — ADVANCED", badge: "NEW" },

  // Live Feed
  { id: "livefeed",   icon: <Radio size={15}/>,         label: "Live Global Threat Feed", group: "LIVE INTEL", badge: "LIVE" },
];

const COMPONENTS = {
  overview:   Overview,
  workspace:  WorkspaceHistory,
  chat:       AIChat,
  phishing:   PhishingDetector,
  deepfake:   DeepfakeAnalyzer,
  email:      EmailAnalyzer,
  malware:    MalwareDetector,
  pentest:    PenTesting,
  webrtc:     WebRTCChecker,
  password:   PasswordTools,
  cve:        CVELookup,
  threats:    ThreatIntel,
  ip:         IPReputation,
  virustotal: VirusTotalScanner,
  dns:        DNSLookup,
  ssl:        SSLAnalyzer,
  subdomains: SubdomainEnum,
  breach:     BreachMonitor,
  livefeed:   LiveThreatFeed,
};

export default function Dashboard({ onHome }) {
  const [tab, setTab]         = useState("overview");
  const [sidebarOpen, setSidebar] = useState(true);

  const groups      = [...new Set(NAV.map(n => n.group))];
  const activeLabel = NAV.find(n => n.id === tab)?.label || "Overview";
  const ActiveComp  = COMPONENTS[tab] || Overview;

  // Pass onNavigate only to Overview
  const renderTool = () => {
    if (tab === "overview") return <Overview onNavigate={setTab} />;
    return <ActiveComp />;
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? 238 : 54,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        transition: "width .22s", flexShrink: 0, overflow: "hidden",
      }}>

        {/* Logo — click goes to landing */}
        <div onClick={onHome} style={{ padding: "17px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 9, flexShrink: 0, cursor: "pointer", transition: "background .18s" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--primary-dim)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          title="Back to Home">
          <Shield size={19} color="var(--primary)" style={{ flexShrink: 0 }} />
          {sidebarOpen && (
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 14.5, fontWeight: 800, color: "var(--white)", whiteSpace: "nowrap" }}>
              NEX<span style={{ color: "var(--primary)" }}>GUARD</span>
              <span style={{ fontSize: 9, color: "var(--text2)", marginLeft: 6, fontFamily: "'JetBrains Mono',monospace", fontWeight: 400 }}>AI</span>
            </span>
          )}
        </div>

        {/* Status */}
        {sidebarOpen && (
          <div style={{ padding: "9px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", boxShadow: "0 0 6px var(--primary)" }} />
            <span style={{ fontSize: 9.5, color: "var(--primary)" }}>ALL SYSTEMS OPERATIONAL</span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
          {groups.map(group => (
            <div key={group}>
              {sidebarOpen && (
                <div style={{ fontSize: 8.5, letterSpacing: ".14em", padding: "14px 8px 5px", fontWeight: 600,
                  color: group.includes("PHASE 2") ? "var(--cyan)" : "var(--muted)" }}>
                  {group}
                </div>
              )}
              {NAV.filter(n => n.group === group).map(n => (
                <button key={n.id}
                  className={`nav-item${tab === n.id ? " active" : ""}`}
                  onClick={() => setTab(n.id)}
                  title={!sidebarOpen ? n.label : undefined}
                  style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}>
                  <span style={{ flexShrink: 0 }}>{n.icon}</span>
                  {sidebarOpen && (
                    <span style={{ flex: 1 }}>{n.label}</span>
                  )}
                  {sidebarOpen && n.badge && (
                    <span style={{ fontSize: 7.5, background: "var(--cyan)", color: "#000", padding: "1px 5px", fontWeight: 700, borderRadius: 2, flexShrink: 0 }}>
                      {n.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "10px 6px", borderTop: "1px solid var(--border)" }}>
          <button className="nav-item" onClick={onHome} title="Back to Home"
            style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.borderLeftColor = "var(--primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = ""; e.currentTarget.style.borderLeftColor = ""; }}>
            <Home size={14} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Back to Home</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <header style={{ padding: "11px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setSidebar(v => !v)}
            style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", padding: 3, display: "flex" }}>
            <Menu size={17}/>
          </button>

          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, fontSize: 11.5 }}>
            <span onClick={onHome} style={{ color: "var(--text2)", cursor: "pointer", transition: "color .18s" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text2)"}>
              nexguard
            </span>
            <ChevronRight size={11} color="var(--muted)"/>
            <span style={{ color: "var(--primary)" }}>{activeLabel}</span>
            {NAV.find(n => n.id === tab)?.badge && (
              <span style={{ fontSize: 7.5, background: "var(--cyan)", color: "#000", padding: "1px 6px", fontWeight: 700 }}>
                {NAV.find(n => n.id === tab)?.badge}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", boxShadow: "0 0 8px var(--primary)" }} />
            <span style={{ fontSize: 10, color: "var(--text2)" }}>AI ONLINE · FREE</span>
          </div>
        </header>

        {/* Threat ticker */}
        <div style={{ padding: "6px 20px", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,.15)", flexShrink: 0 }}>
          <ThreatTicker/>
        </div>

        {/* Content */}
        <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {renderTool()}
        </main>
      </div>
    </div>
  );
}
