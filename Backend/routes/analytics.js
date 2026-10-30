const express    = require("express");
const router     = express.Router();
const Analytics  = require("../models/Analytics");
const optionalAuth = require("../middleware/optionalAuth");
const authMiddleware = require("../middleware/auth");

// ── POST /api/analytics/track ─────────────────────────────────────────────────
// Called from frontend for every meaningful user action
router.post("/track", optionalAuth, async (req, res) => {
  try {
    const { event, tool, page, sessionId, metadata = {} } = req.body;
    if (!event) return res.status(400).json({ error: "event required" });

    await Analytics.create({
      event,
      tool,
      page,
      sessionId: sessionId || req.headers["x-session-id"],
      userId: req.user?._id || null,
      metadata: {
        ip:        req.ip,
        country:   req.headers["cf-ipcountry"] || "",
        userAgent: req.headers["user-agent"]?.slice(0, 200),
        referrer:  req.headers.referer || metadata.referrer || "",
        duration:  metadata.duration || null,
      },
    });

    res.status(201).json({ ok: true });
  } catch (e) {
    // Analytics failures should never surface to user
    res.status(201).json({ ok: true });
  }
});

// ── GET /api/analytics/dashboard ─────────────────────────────────────────────
// Admin-only: platform-wide stats
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Admin access required." });

    const now   = new Date();
    const day   = new Date(now - 86400000);
    const week  = new Date(now - 604800000);
    const month = new Date(now - 2592000000);

    const [
      totalEvents,
      todayEvents,
      weeklyEvents,
      topTools,
      topPages,
      signups,
      scanGateHits,
      uniqueSessions,
      countryBreakdown,
    ] = await Promise.all([
      Analytics.countDocuments(),
      Analytics.countDocuments({ createdAt: { $gte: day } }),
      Analytics.countDocuments({ createdAt: { $gte: week } }),

      // Most used tools
      Analytics.aggregate([
        { $match: { event: "tool_use", createdAt: { $gte: month } } },
        { $group: { _id: "$tool", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]),

      // Most visited pages
      Analytics.aggregate([
        { $match: { event: "page_view", createdAt: { $gte: week } } },
        { $group: { _id: "$page", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Signups this month
      Analytics.countDocuments({ event: "signup", createdAt: { $gte: month } }),

      // How often scan gate triggers (conversion opportunity)
      Analytics.countDocuments({ event: "scan_gate_hit", createdAt: { $gte: week } }),

      // Unique anonymous sessions this week
      Analytics.distinct("sessionId", { createdAt: { $gte: week } }),

      // Traffic by country
      Analytics.aggregate([
        { $match: { createdAt: { $gte: month }, "metadata.country": { $ne: "" } } },
        { $group: { _id: "$metadata.country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
    ]);

    res.json({
      overview: {
        totalEvents,
        todayEvents,
        weeklyEvents,
        signupsThisMonth: signups,
        scanGateHitsThisWeek: scanGateHits,
        uniqueSessionsThisWeek: uniqueSessions.length,
      },
      topTools,
      topPages,
      countryBreakdown,
    });
  } catch (e) {
    console.error("Analytics dashboard error:", e);
    res.status(500).json({ error: "Failed to load analytics." });
  }
});

// ── GET /api/analytics/traffic ────────────────────────────────────────────────
// Daily traffic for last 30 days (for chart)
router.get("/traffic", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Admin access required." });

    const month = new Date(Date.now() - 2592000000);

    const daily = await Analytics.aggregate([
      { $match: { event: "page_view", createdAt: { $gte: month } } },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
            day:   { $dayOfMonth: "$createdAt" },
          },
          visits:   { $sum: 1 },
          sessions: { $addToSet: "$sessionId" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year", month: "$_id.month", day: "$_id.day",
            },
          },
          visits: 1,
          uniqueVisitors: { $size: "$sessions" },
        },
      },
    ]);

    res.json({ daily });
  } catch (e) {
    res.status(500).json({ error: "Failed to load traffic data." });
  }
});

module.exports = router;
