const express = require("express");
const router  = express.Router();
const https   = require("https");
const dns     = require("dns").promises;
const tls     = require("tls");
const url     = require("url");

// ── API Key Checks ────────────────────────────────────────────────────────────
const VT_KEY      = process.env.VIRUSTOTAL_API_KEY;
const ABUSE_KEY   = process.env.ABUSEIPDB_API_KEY;
const HIBP_KEY    = process.env.HIBP_API_KEY;
const HAS_VT      = !!VT_KEY      && VT_KEY      !== "your-virustotal-key-here";
const HAS_ABUSE   = !!ABUSE_KEY   && ABUSE_KEY   !== "your-abuseipdb-key-here";
const HAS_HIBP    = !!HIBP_KEY    && HIBP_KEY    !== "your-hibp-key-here";

// ── MOCK RESPONSES ────────────────────────────────────────────────────────────
const MOCK = {
  virustotal_url: (target) => ({
    target, type: "url", demo: true,
    stats: { malicious: 3, suspicious: 5, harmless: 62, undetected: 4, timeout: 0 },
    verdict: "SUSPICIOUS",
    reputation: -2,
    engines: [
      { engine: "Kaspersky",   result: "Phishing.URL.Generic",   category: "malicious" },
      { engine: "Bitdefender", result: "Clean",                  category: "harmless" },
      { engine: "Google",      result: "Malicious",              category: "malicious" },
      { engine: "ESET",        result: "Suspicious site",        category: "suspicious" },
    ],
    message: "[DEMO] Add VIRUSTOTAL_API_KEY to backend/.env for real 70+ engine scanning.",
  }),
  virustotal_ip: (target) => ({
    target, type: "ip", demo: true,
    stats: { malicious: 1, suspicious: 2, harmless: 71, undetected: 0 },
    verdict: "SUSPICIOUS",
    country: "NL", asn: "AS12345", as_owner: "Demo ISP BV",
    reputation: -1,
    message: "[DEMO] Add VIRUSTOTAL_API_KEY to backend/.env for real scanning.",
  }),
  abuseipdb: (ip) => ({
    ip, demo: true,
    abuse_confidence: 87,
    country_code: "NL",
    isp: "Tor Project",
    domain: "torproject.org",
    total_reports: 142,
    num_distinct_users: 38,
    last_reported: new Date(Date.now() - 3600000).toISOString(),
    is_tor: true,
    is_public: true,
    message: "[DEMO] Add ABUSEIPDB_API_KEY to backend/.env for real abuse data.",
  }),
  breach: (email) => ({
    email, demo: true,
    breached: true,
    breach_count: 4,
    breaches: [
      { name: "Adobe",    date: "2013-10-04", pwn_count: 152445165, data_classes: ["Email","Password","Username"] },
      { name: "LinkedIn", date: "2016-05-05", pwn_count: 164611595, data_classes: ["Email","Password"] },
      { name: "Dropbox",  date: "2012-07-01", pwn_count: 68648009,  data_classes: ["Email","Password"] },
      { name: "MySpace",  date: "2008-07-01", pwn_count: 359420698, data_classes: ["Email","Password","Username"] },
    ],
    pastes: 2,
    message: "[DEMO] Add HIBP_API_KEY to backend/.env for real breach data.",
  }),
};

// ══════════════════════════════════════════════════════════════════════════════
// VIRUSTOTAL — URL / IP / Hash scan
// ══════════════════════════════════════════════════════════════════════════════
router.post("/virustotal", async (req, res) => {
  try {
    const { target, type = "url" } = req.body;
    if (!target) return res.status(400).json({ error: "target required" });

    if (!HAS_VT) {
      return res.json(type === "ip" ? MOCK.virustotal_ip(target) : MOCK.virustotal_url(target));
    }

    // Encode target for VT
    const encoded = Buffer.from(target).toString("base64").replace(/=/g, "");
    const endpoint = type === "url"
      ? `https://www.virustotal.com/api/v3/urls/${encoded}`
      : type === "ip"
      ? `https://www.virustotal.com/api/v3/ip_addresses/${target}`
      : `https://www.virustotal.com/api/v3/files/${target}`;

    // For URLs, first submit then get report
    if (type === "url") {
      await fetch("https://www.virustotal.com/api/v3/urls", {
        method: "POST",
        headers: { "x-apikey": VT_KEY, "Content-Type": "application/x-www-form-urlencoded" },
        body: `url=${encodeURIComponent(target)}`,
      });
    }

    const r    = await fetch(endpoint, { headers: { "x-apikey": VT_KEY } });
    const data = await r.json();
    const attr = data.data?.attributes || {};
    const stats = attr.last_analysis_stats || {};

    const verdict = stats.malicious > 5 ? "MALICIOUS"
      : stats.malicious > 0 || stats.suspicious > 3 ? "SUSPICIOUS"
      : "CLEAN";

    const engines = Object.entries(attr.last_analysis_results || {})
      .filter(([, v]) => v.category !== "undetected")
      .slice(0, 10)
      .map(([engine, v]) => ({ engine, result: v.result || v.category, category: v.category }));

    res.json({ target, type, verdict, stats, engines, reputation: attr.reputation || 0, demo: false });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// ABUSEIPDB — IP Reputation (real-time community reports)
// ══════════════════════════════════════════════════════════════════════════════
router.post("/abuseipdb", async (req, res) => {
  try {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: "ip required" });

    if (!HAS_ABUSE) return res.json(MOCK.abuseipdb(ip));

    const r = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose`,
      { headers: { Key: ABUSE_KEY, Accept: "application/json" } }
    );
    const data = await r.json();
    const d    = data.data || {};

    res.json({
      ip: d.ipAddress, demo: false,
      abuse_confidence: d.abuseConfidenceScore,
      country_code: d.countryCode,
      isp: d.isp,
      domain: d.domain,
      total_reports: d.totalReports,
      num_distinct_users: d.numDistinctUsers,
      last_reported: d.lastReportedAt,
      is_tor: d.isTor || false,
      is_public: d.isPublic,
      usage_type: d.usageType,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// DNS LOOKUP — A, AAAA, MX, TXT, NS, CNAME, SOA
// ══════════════════════════════════════════════════════════════════════════════
router.post("/dns", async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: "domain required" });

    const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();

    const [A, AAAA, MX, TXT, NS, CNAME, SOA] = await Promise.allSettled([
      dns.resolve4(clean),
      dns.resolve6(clean),
      dns.resolveMx(clean),
      dns.resolveTxt(clean),
      dns.resolveNs(clean),
      dns.resolveCname(clean),
      dns.resolveSoa(clean),
    ]);

    // Reverse DNS on first A record
    let rdns = null;
    if (A.status === "fulfilled" && A.value.length > 0) {
      try { const r = await dns.reverse(A.value[0]); rdns = r[0]; } catch {}
    }

    res.json({
      domain: clean,
      records: {
        A:     A.status     === "fulfilled" ? A.value          : [],
        AAAA:  AAAA.status  === "fulfilled" ? AAAA.value        : [],
        MX:    MX.status    === "fulfilled" ? MX.value          : [],
        TXT:   TXT.status   === "fulfilled" ? TXT.value.flat()  : [],
        NS:    NS.status    === "fulfilled" ? NS.value          : [],
        CNAME: CNAME.status === "fulfilled" ? CNAME.value       : [],
        SOA:   SOA.status   === "fulfilled" ? SOA.value         : null,
      },
      reverse_dns: rdns,
      queried_at: new Date().toISOString(),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// WHOIS — via whois.iana.org (text) + rdap.org (JSON)
// ══════════════════════════════════════════════════════════════════════════════
router.post("/whois", async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: "domain required" });

    const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();

    // Use RDAP (modern WHOIS replacement) — completely free
    const r = await fetch(`https://rdap.org/domain/${clean}`, {
      headers: { "Accept": "application/json", "User-Agent": "NexGuard-AI/1.0" },
    });

    if (!r.ok) throw new Error(`RDAP lookup failed: ${r.status}`);
    const data = await r.json();

    // Parse RDAP response
    const events   = data.events || [];
    const entities = data.entities || [];
    const getDate  = (type) => events.find(e => e.eventAction === type)?.eventDate || null;
    const ns       = (data.nameservers || []).map(n => n.ldhName?.toLowerCase());

    const registrant = entities.find(e => e.roles?.includes("registrant"));
    const registrar  = entities.find(e => e.roles?.includes("registrar"));

    res.json({
      domain: clean,
      status: data.status || [],
      registered:  getDate("registration"),
      updated:     getDate("last changed"),
      expires:     getDate("expiration"),
      nameservers: ns,
      registrant:  registrant?.vcardArray?.[1]?.find(v => v[0] === "fn")?.[3] || "Redacted",
      registrar:   registrar?.vcardArray?.[1]?.find(v => v[0] === "fn")?.[3] || "Unknown",
      dnssec:      data.secureDNS?.delegationSigned ? "Signed" : "Unsigned",
      queried_at:  new Date().toISOString(),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// SSL/TLS — certificate analyzer
// ══════════════════════════════════════════════════════════════════════════════
router.post("/ssl", async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: "domain required" });

    const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();

    const certInfo = await new Promise((resolve, reject) => {
      const socket = tls.connect({ host: clean, port: 443, servername: clean, rejectUnauthorized: false, timeout: 8000 }, () => {
        const cert = socket.getPeerCertificate(true);
        const proto = socket.getProtocol();
        const cipher = socket.getCipher();
        socket.end();
        resolve({ cert, proto, cipher });
      });
      socket.on("error", reject);
      socket.on("timeout", () => reject(new Error("Connection timeout")));
    });

    const { cert, proto, cipher } = certInfo;
    const now     = Date.now();
    const expires = new Date(cert.valid_to);
    const issued  = new Date(cert.valid_from);
    const daysLeft = Math.floor((expires - now) / 86400000);

    // Check HSTS header
    let hsts = false;
    try {
      const r = await fetch(`https://${clean}`, { method: "HEAD", redirect: "follow" });
      hsts = !!r.headers.get("strict-transport-security");
    } catch {}

    // Grade: simple A/B/C/F logic
    const grade = proto === "TLSv1.3" && daysLeft > 30 && hsts ? "A+"
      : proto === "TLSv1.2" && daysLeft > 30 ? "A"
      : proto === "TLSv1.2" && daysLeft > 0  ? "B"
      : daysLeft <= 0 ? "F"
      : "C";

    res.json({
      domain: clean,
      valid: daysLeft > 0,
      days_remaining: daysLeft,
      issued:  issued.toISOString(),
      expires: expires.toISOString(),
      issuer:  cert.issuer?.O || cert.issuer?.CN || "Unknown",
      subject: cert.subject?.CN || clean,
      san:     cert.subjectaltname?.split(", ").map(s => s.replace("DNS:", "")) || [],
      tls_version: proto,
      cipher:  cipher?.name || "Unknown",
      bits:    cipher?.secretKeySize || 0,
      hsts,
      grade,
      self_signed: cert.issuer?.CN === cert.subject?.CN,
      wildcard: (cert.subject?.CN || "").startsWith("*"),
      queried_at: new Date().toISOString(),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// SUBDOMAINS — via crt.sh (certificate transparency logs — 100% free)
// ══════════════════════════════════════════════════════════════════════════════
router.post("/subdomains", async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: "domain required" });

    const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();

    const r = await fetch(
      `https://crt.sh/?q=%25.${encodeURIComponent(clean)}&output=json`,
      { headers: { "User-Agent": "NexGuard-AI/1.0" }, timeout: 15000 }
    );

    if (!r.ok) throw new Error(`crt.sh error: ${r.status}`);
    const data = await r.json();

    // Deduplicate and clean subdomains
    const seen = new Set();
    const subs = [];

    for (const entry of data) {
      const names = entry.name_value.split("\n");
      for (const name of names) {
        const n = name.trim().toLowerCase().replace(/^\*\./, "");
        if (n && n.endsWith(clean) && !seen.has(n)) {
          seen.add(n);
          subs.push({
            subdomain: n,
            issuer: entry.issuer_name?.match(/O=([^,]+)/)?.[1]?.trim() || "Unknown",
            logged: entry.entry_timestamp,
            wildcard: entry.name_value.includes("*."),
          });
        }
      }
    }

    // Sort: root domain first, then alphabetical
    subs.sort((a, b) => {
      if (a.subdomain === clean) return -1;
      if (b.subdomain === clean) return 1;
      return a.subdomain.localeCompare(b.subdomain);
    });

    res.json({
      domain: clean,
      total: subs.length,
      subdomains: subs.slice(0, 100), // cap at 100
      source: "crt.sh (Certificate Transparency Logs)",
      queried_at: new Date().toISOString(),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// BREACH CHECK — HaveIBeenPwned
// ══════════════════════════════════════════════════════════════════════════════
router.post("/breach", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    if (!HAS_HIBP) return res.json(MOCK.breach(email));

    const r = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      { headers: { "hibp-api-key": HIBP_KEY, "User-Agent": "NexGuard-AI" } }
    );

    if (r.status === 404) return res.json({ email, breached: false, breach_count: 0, breaches: [], pastes: 0, demo: false });
    if (!r.ok) throw new Error(`HIBP error: ${r.status}`);

    const breaches = await r.json();

    // Also check pastes
    let pastes = 0;
    try {
      const pr = await fetch(
        `https://haveibeenpwned.com/api/v3/pasteaccount/${encodeURIComponent(email)}`,
        { headers: { "hibp-api-key": HIBP_KEY, "User-Agent": "NexGuard-AI" } }
      );
      if (pr.ok) { const pd = await pr.json(); pastes = pd.length; }
    } catch {}

    res.json({
      email, demo: false,
      breached: breaches.length > 0,
      breach_count: breaches.length,
      pastes,
      breaches: breaches.map(b => ({
        name: b.Name,
        date: b.BreachDate,
        pwn_count: b.PwnCount,
        data_classes: b.DataClasses,
        description: b.Description?.replace(/<[^>]*>/g, "").slice(0, 200),
      })),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
