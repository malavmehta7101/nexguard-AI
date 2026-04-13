import { useState, useEffect, useRef } from "react";
import { Shield, Terminal, Zap, Globe, Eye, AlertTriangle, Lock, ChevronRight, Activity, Cpu, Database, Mail, Mic, Key, Network, Bug, Search } from "lucide-react";
import MatrixRain from "../Components/MatrixRain.jsx";
import ThreatTicker from "../Components/ThreatTicker.jsx";

// ── Live Counter ───────────────────────────────────────────────────────────────
function LiveCounter({ target, prefix = "", suffix = "", label, color }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = 0;
      const step = Math.ceil(target / 60);
      const id = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(start);
        if (start >= target) clearInterval(id);
      }, 24);
      obs.disconnect();
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 800, color: color || "var(--primary)", lineHeight: 1, animation: "countUp .5s ease both" }}>
        {prefix}{val.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 10, color: "var(--text2)", marginTop: 6, letterSpacing: ".12em" }}>{label}</div>
    </div>
  );
}

// ── Animated Terminal Demo ─────────────────────────────────────────────────────
const DEMO_LINES = [
  { d: 400,  c: "var(--primary)", t: "nexguard > scan --target example.com --deep" },
  { d: 900,  c: "var(--text)",    t: "[+] Initiating threat intelligence scan..." },
  { d: 1400, c: "var(--text)",    t: "[+] Checking CVE database... 247,891 entries" },
  { d: 1900, c: "var(--warning)", t: "[!] CVE-2024-21413 detected (CVSS 9.8 CRITICAL)" },
  { d: 2400, c: "var(--text)",    t: "[+] Running phishing domain analysis..." },
  { d: 2900, c: "var(--danger)",  t: "[!] Typosquatting detected: examp1e.com" },
  { d: 3400, c: "var(--text)",    t: "[+] WebRTC leak test... checking ICE candidates..." },
  { d: 3900, c: "var(--danger)",  t: "[!] IP LEAK: 192.168.1.1 exposed via WebRTC" },
  { d: 4400, c: "var(--text)",    t: "[+] Malware signature scan complete..." },
  { d: 4900, c: "var(--primary)", t: "[✓] Report generated. 3 critical findings." },
  { d: 5400, c: "var(--cyan)",    t: "nexguard > _" },
];

function TerminalDemo() {
  const [lines, setLines] = useState([]);
  useEffect(() => {
    let mounted = true;
    setLines([]);
    DEMO_LINES.forEach(({ d, c, t }) => {
      setTimeout(() => {
        if (mounted) setLines(prev => [...prev, { c, t }]);
      }, d);
    });
    const loop = setInterval(() => {
      if (mounted) {
        setLines([]);
        DEMO_LINES.forEach(({ d, c, t }) => setTimeout(() => { if (mounted) setLines(prev => [...prev, { c, t }]); }, d));
      }
    }, 7000);
    return () => { mounted = false; clearInterval(loop); };
  }, []);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, lineHeight: 1.85, minHeight: 260 }}>
      <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
        {["#ff5f57","#febc2e","#28c840"].map((c,i) => <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
        <span style={{ fontSize: 10, color: "var(--text2)", marginLeft: 8 }}>nexguard-ai — bash</span>
      </div>
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.c, animation: "fadeUp .25s ease both" }}>{l.t}</div>
      ))}
    </div>
  );
}

// ── Feature Card ───────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, tag, delay = 0 }) {
  return (
    <div className="card fade-up" style={{ padding: "22px 20px", animationDelay: `${delay}s`, transition: "transform .25s, box-shadow .25s", cursor: "default" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,232,122,.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, background: "var(--primary-dim)", border: "1px solid rgba(0,232,122,.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>{icon}</div>
        {tag && <span className={`tag ${tag}`}>{tag === "d" ? "NEW" : tag === "w" ? "HOT" : "AI"}</span>}
      </div>
      <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 14.5, fontWeight: 700, color: "var(--white)", marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 11.5, color: "var(--text)", lineHeight: 1.8 }}>{desc}</p>
    </div>
  );
}

// ── Main Landing ───────────────────────────────────────────────────────────────
export default function Landing({ onEnter }) {
  const [stats, setStats] = useState({ threatsBlocked: 284512, scansToday: 12400, cveDatabase: 247891 });

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {});
    const id = setInterval(() => setStats(s => ({ ...s, threatsBlocked: s.threatsBlocked + Math.floor(Math.random() * 4) })), 3500);
    return () => clearInterval(id);
  }, []);

  const features = [
    { icon: <Shield size={18} />, title: "AI Phishing Detection",      desc: "Real-time URL and content analysis with ML-powered domain spoofing, typosquatting, and social engineering detection.", tag: "g" },
    { icon: <Eye size={18} />,    title: "Deepfake Audio & Video",      desc: "Detect synthetic media with AI analysis of GAN artifacts, audio-visual sync, and generative model fingerprints.", tag: "d" },
    { icon: <Mail size={18} />,   title: "Smart Email Analyzer",        desc: "Full email forensics: header analysis, SPF/DKIM/DMARC checks, BEC patterns, and embedded threat detection.", tag: "g" },
    { icon: <Network size={18} />,title: "WebRTC Privacy Leak Test",    desc: "Detect real IP exposure via WebRTC ICE candidates — even behind VPN. Identifies IPv4/IPv6 leaks in real time.", tag: "w" },
    { icon: <Key size={18} />,    title: "Advanced Password Tools",     desc: "Entropy-based strength scoring, breach detection patterns, password generation, and cryptographic hash analysis.", tag: "g" },
    { icon: <Terminal size={18} />,title: "24/7 AI Security Assistant", desc: "NEXGUARD-powered expert assistant for CVE analysis, malware research, forensics, and cybersecurity Q&A.", tag: "g" },
    { icon: <Bug size={18} />,    title: "AI-Powered Pen Testing",      desc: "Guided penetration testing methodology with OWASP/PTES alignment, tool recommendations, and exploitation guidance.", tag: "w" },
    { icon: <Cpu size={18} />,    title: "AI Malware Detection",        desc: "Behavioral and static analysis with MITRE ATT&CK mapping, IOC extraction, and threat actor profiling.", tag: "d" },
    { icon: <Database size={18} />,title: "CVE Intelligence",           desc: "Deep CVE analysis with CVSS scoring, exploitation status, affected systems, and step-by-step remediation.", tag: "g" },
    { icon: <Globe size={18} />,  title: "IP Reputation & Threat Intel",desc: "AI-driven IP analysis for Tor nodes, VPN services, datacenter ranges, botnet C2s, and geo-threat intelligence.", tag: "g" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>
      {/* ── Topbar ───────────────────────────────────────────── */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid rgba(0,232,122,.12)", padding: "7px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <ThreatTicker />
        <div style={{ fontSize: 10, color: "var(--text2)", whiteSpace: "nowrap", flexShrink: 0 }}>
          🛡 <span style={{ color: "var(--primary)" }}>{stats.threatsBlocked.toLocaleString()}</span> threats blocked today
        </div>
      </div>

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 40px", background: "rgba(1,5,10,.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={20} color="var(--primary)" />
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 800, color: "var(--white)", letterSpacing: ".02em" }}>
            NEX<span className="glow-anim" style={{ color: "var(--primary)" }}>GUARD</span>
            <span style={{ fontSize: 10, color: "var(--text2)", marginLeft: 7, fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 }}>AI</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href="#features" style={{ fontSize: 11.5, color: "var(--text2)", textDecoration: "none", padding: "0 10px" }}
            onMouseEnter={e => e.target.style.color = "var(--primary)"} onMouseLeave={e => e.target.style.color = "var(--text2)"}>Features</a>
          <a href="#stats" style={{ fontSize: 11.5, color: "var(--text2)", textDecoration: "none", padding: "0 10px" }}
            onMouseEnter={e => e.target.style.color = "var(--primary)"} onMouseLeave={e => e.target.style.color = "var(--text2)"}>Stats</a>
          <button className="btn solid" onClick={onEnter} style={{ fontSize: 12, padding: "9px 22px" }}>
            Launch Platform <ChevronRight size={13} />
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="grid-bg" style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", padding: "80px 40px 60px" }}>
        <MatrixRain opacity={0.14} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div className="tag g fade-up" style={{ marginBottom: 20 }}>◈ AI-POWERED · ZERO LOGIN REQUIRED</div>
            <h1 className="fade-up" style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(36px,5vw,68px)", fontWeight: 800, lineHeight: 1.05, color: "var(--white)", marginBottom: 18, animationDelay: ".07s" }}>
              The AI<br />
              <span className="glow-anim" style={{ color: "var(--primary)" }}>Cybersecurity</span><br />
              Platform
            </h1>
            <p className="fade-up" style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.85, maxWidth: 480, marginBottom: 34, animationDelay: ".14s" }}>
              NexGuard AI combines cutting-edge machine learning with deep security expertise. Detect phishing, analyze deepfakes, identify malware, and harden your systems — all powered by AI. No account needed.
            </p>
            <div className="fade-up" style={{ display: "flex", gap: 12, flexWrap: "wrap", animationDelay: ".21s" }}>
              <button className="btn solid lg" onClick={onEnter}>
                <Zap size={15} /> Launch Free Platform
              </button>
              <button className="btn cyan" style={{ padding: "13px 24px", fontSize: 12 }} onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                Explore Features →
              </button>
            </div>
            <div className="fade-up" style={{ marginTop: 24, display: "flex", gap: 20, flexWrap: "wrap", animationDelay: ".28s" }}>
              {["No account required","100% AI-powered","10+ security tools","Real-time analysis"].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text2)" }}>
                  <div style={{ width: 5, height: 5, background: "var(--primary)", borderRadius: "50%", boxShadow: "0 0 5px var(--primary)" }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="fade-up float" style={{ animationDelay: ".1s" }}>
            <TerminalDemo />
            <div style={{ marginTop: 12, display: "flex", gap: 9 }}>
              <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                <Activity size={14} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: 9.5, color: "var(--text2)", letterSpacing: ".1em" }}>THREATS TODAY</div>
                  <div style={{ fontSize: 15, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--primary)" }}>{stats.threatsBlocked.toLocaleString()}</div>
                </div>
              </div>
              <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                <Database size={14} color="var(--cyan)" />
                <div>
                  <div style={{ fontSize: 9.5, color: "var(--text2)", letterSpacing: ".1em" }}>CVE DATABASE</div>
                  <div style={{ fontSize: 15, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--cyan)" }}>{stats.cveDatabase.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section id="stats" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--border)" }}>
          {[
            { target: stats.threatsBlocked, suffix: "+", label: "THREATS BLOCKED", color: "var(--danger)" },
            { target: stats.cveDatabase,    suffix: "+", label: "CVE ENTRIES",     color: "var(--cyan)" },
            { target: 99,  suffix: ".97%",   label: "PLATFORM UPTIME",   color: "var(--primary)" },
            { target: stats.scansToday,     suffix: "+", label: "SCANS TODAY",     color: "var(--warning)" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--surface)", padding: "36px 20px" }}>
              <LiveCounter {...s} />
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section style={{ padding: "80px 40px", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div className="tag c" style={{ marginBottom: 14 }}>◈ HOW IT WORKS</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 800, color: "var(--white)" }}>
            Security Intelligence in <span style={{ color: "var(--cyan)" }}>3 Steps</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {[
            { n: "01", icon: <Search size={22} />, t: "Submit Your Target",    d: "Enter a URL, IP, email, file hash, or paste suspicious content into any of our AI-powered tools. No setup or account needed." },
            { n: "02", icon: <Cpu size={22} />,    t: "AI Analysis Engine",    d: "Our Claude-powered AI cross-references threat intelligence databases, CVE feeds, and behavioral patterns in real time." },
            { n: "03", icon: <Shield size={22} />, t: "Actionable Intelligence",d: "Receive detailed findings with risk scores, MITRE ATT&CK mappings, IOCs, and step-by-step remediation guidance." },
          ].map((s, i) => (
            <div key={i} className="card fade-up" style={{ padding: "28px", textAlign: "center", animationDelay: `${i * .1}s` }}>
              <div style={{ width: 56, height: 56, background: "var(--primary-dim)", border: "1px solid rgba(0,232,122,.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", margin: "0 auto 16px" }}>{s.icon}</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(0,232,122,.4)", marginBottom: 8, letterSpacing: ".15em" }}>{s.n}</div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--white)", marginBottom: 10 }}>{s.t}</h3>
              <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.8 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section id="features" style={{ padding: "20px 40px 80px", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="tag g" style={{ marginBottom: 14 }}>◈ SECURITY ARSENAL</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 800, color: "var(--white)" }}>
            10+ AI-Powered <span style={{ color: "var(--primary)" }}>Security Tools</span>
          </h2>
          <p style={{ fontSize: 12.5, color: "var(--text)", marginTop: 12, maxWidth: 520, margin: "12px auto 0" }}>
            Every tool powered by AI. No subscriptions, no accounts, no limits on the free tier.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {features.map((f, i) => <FeatureCard key={i} {...f} delay={i * 0.04} />)}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{ padding: "72px 40px", borderTop: "1px solid var(--border)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,232,122,.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="tag g" style={{ marginBottom: 16 }}>◈ FREE · NO ACCOUNT REQUIRED</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 800, color: "var(--white)", marginBottom: 14 }}>
            Start Securing Your Digital Life
          </h2>
          <p style={{ fontSize: 13, color: "var(--text)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
            All tools are free and accessible instantly.
          </p>
          <button className="btn solid lg" onClick={onEnter}>
            <Zap size={16} /> Open Platform — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{ padding: "22px 40px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={14} color="var(--primary)" />
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 800, color: "var(--white)" }}>NEXGUARD AI</span>
        </div>
        <div style={{ fontSize: 10.5, color: "var(--text2)" }}>
          Powered by Malav Mehta · For authorized security research only · © 2025 NexGuard
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["SAFE USE POLICY","GITHUB","DOCS"].map((l, i) => (
            <span key={i} style={{ fontSize: 10, color: "var(--text2)", cursor: "pointer", padding: "0 6px" }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
