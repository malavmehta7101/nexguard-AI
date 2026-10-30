// NexGuard AI — Global Cyber Incidents Route
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { sendCyberIncidentAlert } = require("../services/email");

// ── Public: Get live incidents feed (aggregated from free sources) ──────────────
router.get("/feed", async (req, res) => {
  try {
    // Fetch from CISA Known Exploited Vulnerabilities (free, no key needed)
    const cisaRes = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", {
      signal: AbortSignal.timeout(8000),
    }).catch(() => null);

    let cisaItems = [];
    if (cisaRes?.ok) {
      const data = await cisaRes.json();
      cisaItems = (data.vulnerabilities || []).slice(0, 10).map(v => ({
        id: v.cveID,
        title: `${v.cveID}: ${v.vulnerabilityName}`,
        severity: v.knownRansomwareCampaignUse === "Known" ? "critical" : "high",
        category: "Known Exploited Vulnerability",
        region: "Global",
        source: "CISA KEV",
        sourceUrl: `https://nvd.nist.gov/vuln/detail/${v.cveID}`,
        description: `${v.shortDescription} Affected product: ${v.product} by ${v.vendorProject}. Required action: ${v.requiredAction}`,
        affected: `${v.product} (${v.vendorProject}) — ${v.affectedSystem || "see NVD for details"}`,
        dateAdded: v.dateAdded,
        dueDate: v.dueDate,
        cves: [v.cveID],
        steps: [
          `Apply the required patch or mitigation for ${v.product} immediately`,
          `Check CISA advisory: https://www.cisa.gov/known-exploited-vulnerabilities-catalog`,
          "Verify no exploitation has occurred by reviewing security logs",
          "If patch unavailable, implement workarounds per vendor advisory",
          "Report any confirmed exploitation to CISA at https://www.cisa.gov/report"
        ]
      }));
    }

    // Fetch recent high-severity CVEs from NVD (free)
    const nvdRes = await fetch(
      "https://services.nvd.nist.gov/rest/json/cves/2.0?cvssV3Severity=CRITICAL&resultsPerPage=8&startIndex=0",
      {
        headers: process.env.NVD_API_KEY ? { "apiKey": process.env.NVD_API_KEY } : {},
        signal: AbortSignal.timeout(8000),
      }
    ).catch(() => null);

    let nvdItems = [];
    if (nvdRes?.ok) {
      const data = await nvdRes.json();
      nvdItems = (data.vulnerabilities || []).slice(0, 8).map(v => {
        const cve = v.cve;
        const desc = cve.descriptions?.find(d => d.lang === "en")?.value || "No description available";
        const cvss = cve.metrics?.cvssMetricV31?.[0]?.cvssData || cve.metrics?.cvssMetricV30?.[0]?.cvssData || {};
        return {
          id: cve.id,
          title: `${cve.id} — CVSS ${cvss.baseScore || "N/A"} Critical`,
          severity: "critical",
          category: "Critical CVE",
          region: "Global",
          source: "NIST NVD",
          sourceUrl: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
          description: desc.slice(0, 300) + (desc.length > 300 ? "..." : ""),
          cves: [cve.id],
          dateAdded: cve.published,
          cvssScore: cvss.baseScore,
          steps: [
            "Check if your systems use the affected software/library",
            "Apply vendor patches immediately — this is rated CRITICAL",
            "Monitor your networks for exploitation indicators",
            "Review and restrict network access to affected services",
            "Enable enhanced logging on any affected systems"
          ]
        };
      });
    }

    // Combine and deduplicate by ID
    const seen = new Set();
    const combined = [...cisaItems, ...nvdItems].filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    res.json({
      incidents: combined,
      lastUpdated: new Date().toISOString(),
      sources: ["CISA KEV", "NIST NVD"],
      total: combined.length
    });
  } catch (err) {
    console.error("Incident feed error:", err.message);
    res.status(500).json({ error: "Failed to fetch incident feed" });
  }
});

// ── Admin: Manually trigger incident alert to all users ──────────────────────
// POST /api/incidents/alert  (requires auth — admin only for now)
router.post("/alert", auth, async (req, res) => {
  try {
    const { incident } = req.body;
    if (!incident?.title || !incident?.description) {
      return res.status(400).json({ error: "incident.title and incident.description are required" });
    }

    // Get all users who have email alerts enabled (or all users by default)
    const users = await User.find({
      "emailPrefs.incidentAlerts": { $ne: false },  // default true
      email: { $exists: true }
    }).select("email username").lean();

    if (!users.length) return res.json({ sent: 0, message: "No eligible users" });

    await sendCyberIncidentAlert({ recipients: users, incident });

    res.json({ sent: users.length, message: `Alert sent to ${users.length} users` });
  } catch (err) {
    console.error("Incident alert error:", err.message);
    res.status(500).json({ error: "Failed to send alert" });
  }
});

// ── Auto-alert: Check CISA for new critical incidents and email users ─────────
// Called by a cron job or manually — GET /api/incidents/check-and-alert
router.get("/check-and-alert", auth, async (req, res) => {
  try {
    const response = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
      { signal: AbortSignal.timeout(8000) });
    const data = await response.json();

    // Get the most recently added KEV (today's if any)
    const today = new Date().toISOString().split("T")[0];
    const newToday = (data.vulnerabilities || []).filter(v => v.dateAdded === today);

    if (!newToday.length) {
      return res.json({ alerted: false, message: "No new CISA KEVs added today" });
    }

    const incident = {
      title: `CISA Alert: ${newToday.length} New Known Exploited Vulnerabilities Added`,
      severity: "critical",
      category: "CISA Known Exploited Vulnerability",
      region: "Global",
      description: `CISA has added ${newToday.length} new CVE(s) to the Known Exploited Vulnerabilities catalog today: ${newToday.map(v => v.cveID).join(", ")}. These vulnerabilities are actively being exploited in the wild.`,
      cves: newToday.map(v => v.cveID),
      affected: newToday.map(v => `${v.product} (${v.vendorProject})`).join("; "),
      steps: [
        "Immediately check if your systems use any of the affected products",
        "Apply required patches by the CISA due date or sooner",
        "Review CISA advisory for each CVE at cisa.gov/known-exploited-vulnerabilities-catalog",
        "Enable threat hunting for IOCs related to these vulnerabilities",
        "Report any active exploitation to CISA via cisa.gov/report"
      ]
    };

    const users = await User.find({ email: { $exists: true } }).select("email username").lean();
    await sendCyberIncidentAlert({ recipients: users, incident });

    res.json({ alerted: true, newCVEs: newToday.map(v => v.cveID), usersNotified: users.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
