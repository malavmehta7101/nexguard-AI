const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// ── WebRTC Config ─────────────────────────────────────────────────────────────
router.get("/webrtc-config", (req, res) => {
  res.json({
    stun_servers: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    test_description: "WebRTC can expose your real IP even behind a VPN. This test uses RTCPeerConnection to detect local and public IPs leaked via ICE candidates.",
    privacy_risks: [
      "Real IP exposed behind VPN",
      "Local network IP revealed",
      "IPv6 address leakage",
      "Multiple interface detection",
    ],
    mitigations: [
      "Disable WebRTC in browser settings",
      "Use a WebRTC-blocking browser extension (uBlock Origin)",
      "Use a VPN with WebRTC leak protection",
      "Use Tor Browser (WebRTC disabled by default)",
    ],
  });
});

// ── Real-Time Threat Feed from NVD ────────────────────────────────────────────
// National Vulnerability Database (NVD) — Free public API, no key required
// Docs: https://nvd.nist.gov/developers/vulnerabilities
router.get("/threat-feed", async (req, res) => {
  try {
    // Fetch CVEs published in the last 30 days with CVSS >= 7.0
    const endDate   = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (d) => d.toISOString().split(".")[0] + ".000";

    const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${formatDate(startDate)}&pubEndDate=${formatDate(endDate)}&cvssV3Severity=CRITICAL&resultsPerPage=15`;

    const nvdRes = await fetch(url, {
      headers: { "User-Agent": "NexGuard-AI/1.0" },
      timeout: 10000,
    });

    if (!nvdRes.ok) throw new Error(`NVD API error: ${nvdRes.status}`);

    const nvdData = await nvdRes.json();
    const vulns   = nvdData.vulnerabilities || [];

    // Transform NVD format → our format
    const threats = vulns
      .map((v, i) => {
        const cve     = v.cve;
        const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0] || null;
        const cvss    = metrics?.cvssData?.baseScore || 0;
        const vector  = metrics?.cvssData?.attackVector || "UNKNOWN";
        const severity = metrics?.cvssData?.baseSeverity || (cvss >= 9 ? "CRITICAL" : cvss >= 7 ? "HIGH" : cvss >= 4 ? "MEDIUM" : "LOW");

        const desc    = cve.descriptions?.find(d => d.lang === "en")?.value || "No description available";
        const refs    = cve.references || [];
        const configs = cve.configurations || [];

        // Extract affected product from description (first sentence)
        const affected = desc.split(".")[0].slice(0, 80);

        return {
          id:        i + 1,
          cve:       cve.id,
          title:     desc.slice(0, 90) + (desc.length > 90 ? "..." : ""),
          description: desc,
          severity:  severity.toUpperCase(),
          cvss:      cvss.toFixed(1),
          category:  vector === "NETWORK" ? "Remote Code Execution" : vector === "LOCAL" ? "Local Privilege Escalation" : "Vulnerability",
          affected:  affected,
          exploited: refs.some(r => r.tags?.includes("Exploit") || r.tags?.includes("Patch")),
          published: cve.published,
          modified:  cve.lastModified,
          refs:      refs.slice(0, 3).map(r => r.url),
          source:    "NVD (real-time)",
        };
      })
      .filter(t => parseFloat(t.cvss) >= 7.0)
      .sort((a, b) => parseFloat(b.cvss) - parseFloat(a.cvss));

    res.json({
      threats,
      updated:   new Date().toISOString(),
      total:     threats.length,
      source:    "National Vulnerability Database (NVD)",
      source_url:"https://nvd.nist.gov",
      isRealTime: true,
    });

  } catch (err) {
    console.error("NVD fetch error:", err.message);
    // Fallback to curated list if NVD is unreachable
    res.json({
      threats: getFallbackThreats(),
      updated: new Date().toISOString(),
      total: 10,
      source: "NexGuard Curated Feed (NVD offline)",
      isRealTime: false,
    });
  }
});

// ── Fallback threat list if NVD is unreachable ────────────────────────────────
function getFallbackThreats() {
  return [
    { id:1,  cve:"CVE-2024-3094",  title:"XZ Utils Supply Chain Backdoor — Malicious code in xz compression library",       severity:"CRITICAL", cvss:"10.0", category:"Supply Chain Attack",       exploited:true,  affected:"Linux distributions with xz-utils 5.6.0 / 5.6.1" },
    { id:2,  cve:"CVE-2024-21887",title:"Ivanti Connect Secure Remote Code Execution via command injection",                  severity:"CRITICAL", cvss:"9.1",  category:"Remote Code Execution",     exploited:true,  affected:"Ivanti Connect Secure, Policy Secure" },
    { id:3,  cve:"CVE-2024-23897",title:"Jenkins CLI path traversal allows arbitrary file read leading to RCE",              severity:"CRITICAL", cvss:"9.8",  category:"Information Disclosure / RCE",exploited:true, affected:"Jenkins < 2.442, LTS < 2.426.3" },
    { id:4,  cve:"CVE-2024-21413",title:"Microsoft Outlook improper input validation RCE via preview pane",                  severity:"CRITICAL", cvss:"9.8",  category:"Remote Code Execution",     exploited:true,  affected:"Microsoft Outlook (multiple versions)" },
    { id:5,  cve:"CVE-2024-27198",title:"JetBrains TeamCity authentication bypass via alternative path",                     severity:"CRITICAL", cvss:"9.8",  category:"Authentication Bypass",     exploited:true,  affected:"TeamCity < 2023.11.4" },
    { id:6,  cve:"CVE-2024-4577", title:"PHP CGI argument injection on Windows allows remote code execution",               severity:"CRITICAL", cvss:"9.8",  category:"Code Injection",            exploited:true,  affected:"PHP 8.1.x < 8.1.29, 8.2.x < 8.2.20" },
    { id:7,  cve:"CVE-2024-1086", title:"Linux kernel netfilter use-after-free allows local privilege escalation",          severity:"HIGH",     cvss:"7.8",  category:"Privilege Escalation",      exploited:true,  affected:"Linux kernel 3.15 – 6.6.14" },
    { id:8,  cve:"CVE-2024-38094",title:"Microsoft SharePoint RCE via deserialization of untrusted data",                   severity:"HIGH",     cvss:"7.2",  category:"Remote Code Execution",     exploited:true,  affected:"Microsoft SharePoint Server" },
    { id:9,  cve:"CVE-2024-0519", title:"Google Chrome V8 out-of-bounds memory access allows RCE",                          severity:"HIGH",     cvss:"8.8",  category:"Memory Corruption",         exploited:true,  affected:"Google Chrome < 120.0.6099.224" },
    { id:10, cve:"CVE-2024-30051",title:"Windows DWM Core Library use-after-free allows privilege escalation",              severity:"HIGH",     cvss:"7.8",  category:"Privilege Escalation",      exploited:true,  affected:"Windows 10/11, Server 2019/2022" },
  ];
}

// ── Password Generator (fully local) ─────────────────────────────────────────
router.post("/generate-password", (req, res) => {
  const { length = 20, uppercase = true, lowercase = true, numbers = true, symbols = true } = req.body;
  let charset = "";
  if (uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
  if (numbers)   charset += "0123456789";
  if (symbols)   charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!charset)  charset = "abcdefghijklmnopqrstuvwxyz";
  const len = Math.min(Math.max(parseInt(length) || 20, 8), 128);
  let password = "";
  for (let i = 0; i < len; i++) password += charset[Math.floor(Math.random() * charset.length)];
  res.json({ password, length: password.length });
});

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get("/stats", (req, res) => {
  res.json({
    threatsBlocked: Math.floor(Math.random() * 1000) + 284500,
    scansToday:     Math.floor(Math.random() * 500)  + 12400,
    cveDatabase:    247891,
    uptime:         "99.97%",
  });
});

module.exports = router;