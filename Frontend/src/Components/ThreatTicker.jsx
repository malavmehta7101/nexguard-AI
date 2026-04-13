import { useState, useEffect } from "react";

const EVENTS = [
  "ALERT: Ransomware payload detected in email attachment from 185.220.101.45",
  "WARN:  CVE-2024-3094 exploitation attempt blocked · origin: 94.102.49.190",
  "ALERT: SQL injection probe on /api/users · 47 attempts in 2 minutes",
  "INFO:  Tor exit node traffic spike · 1,204 blocked connections",
  "ALERT: Credential stuffing attack · 8,432 failed logins from 23 IPs",
  "WARN:  Phishing domain registered: paypa1-secure-login[.]com",
  "ALERT: Deepfake audio detected in customer support call",
  "INFO:  WebRTC leak test completed · 3 IPs exposed via ICE candidates",
  "WARN:  Malware C2 beacon detected · MITRE T1071.001",
  "ALERT: Zero-day exploit attempt · Apache 2.4.x path traversal",
  "INFO:  New CVE published: CVSS 9.8 · Microsoft Windows Kernel RCE",
  "ALERT: Brute force SSH · 4,201 attempts from botnet cluster",
  "WARN:  Suspicious PowerShell execution · encoded command detected",
  "ALERT: Data exfiltration attempt · 847MB to unknown S3 bucket",
  "INFO:  Threat intel updated · 1,247 new IOCs added to database",
];

export default function ThreatTicker() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent(c => (c + 1) % EVENTS.length);
        setFade(true);
      }, 300);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const msg = EVENTS[current];
  const isAlert = msg.startsWith("ALERT");
  const isWarn  = msg.startsWith("WARN");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden", maxWidth: "100%" }}>
      <div className={`tag ${isAlert ? "d" : isWarn ? "w" : "c"}`} style={{ flexShrink: 0, fontWeight: 600 }}>
        {isAlert ? "LIVE" : isWarn ? "WARN" : "INFO"}
      </div>
      <div style={{
        fontSize: 10.5, color: isAlert ? "rgba(255,45,94,.75)" : isWarn ? "rgba(255,170,0,.75)" : "rgba(0,212,255,.65)",
        opacity: fade ? 1 : 0, transition: "opacity .3s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        letterSpacing: ".04em",
      }}>
        {msg.slice(7)}
      </div>
    </div>
  );
}
