const express    = require("express");
const router     = express.Router();
const Scan       = require("../models/Scan");
const authMiddleware     = require("../middleware/auth");
const optionalAuth       = require("../middleware/optionalAuth");
const scanGate           = require("../middleware/scanGate");

// ── POST /api/scans/save ──────────────────────────────────────────────────────
// Called after every successful AI scan to persist to MongoDB
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { tool, query, verdict, result } = req.body;

    const scan = await Scan.create({
      userId:  req.user._id,
      tool,
      query:   String(query).slice(0, 500),
      verdict,
      result:  result ? JSON.parse(JSON.stringify(result)) : null,
      metadata: {
        ip:        req.ip,
        userAgent: req.headers["user-agent"]?.slice(0, 200),
        demoMode:  !process.env.ANTHROPIC_API_KEY,
      },
    });

    res.status(201).json({ id: scan._id, message: "Scan saved." });
  } catch (e) {
    console.error("Save scan error:", e);
    res.status(500).json({ error: "Failed to save scan." });
  }
});

// ── GET /api/scans/history ────────────────────────────────────────────────────
// Paginated scan history for authenticated user
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const tool  = req.query.tool; // optional filter
    const query = { userId: req.user._id };
    if (tool) query.tool = tool;

    const [scans, total] = await Promise.all([
      Scan.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      Scan.countDocuments(query),
    ]);

    res.json({
      scans,
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

// ── GET /api/scans/stats ──────────────────────────────────────────────────────
// User's personal scan stats breakdown by tool
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const [byTool, total, recent] = await Promise.all([
      Scan.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: "$tool", count: { $sum: 1 }, lastUsed: { $max: "$createdAt" } } },
        { $sort: { count: -1 } },
      ]),
      Scan.countDocuments({ userId: req.user._id }),
      Scan.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    res.json({ total, byTool, recent });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

// ── DELETE /api/scans/:id ─────────────────────────────────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const scan = await Scan.findOneAndDelete({
      _id: req.params.id, userId: req.user._id,
    });
    if (!scan) return res.status(404).json({ error: "Scan not found." });
    res.json({ message: "Scan deleted." });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete scan." });
  }
});

// ── DELETE /api/scans/all ─────────────────────────────────────────────────────
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const result = await Scan.deleteMany({ userId: req.user._id });
    res.json({ message: `Deleted ${result.deletedCount} scans.` });
  } catch (e) {
    res.status(500).json({ error: "Failed to clear history." });
  }
});

module.exports = router;
