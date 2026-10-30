const Analytics = require("../models/Analytics");

module.exports = async (req, res, next) => {
  try {
    if (req.user) {
      const check = req.user.canScan();
      if (!check.allowed) {
        return res.status(403).json({
          error: check.reason, code: "SCAN_LIMIT_REACHED", upgradeUrl: "/pro",
        });
      }
      req.user.scanCount    = (req.user.scanCount || 0) + 1;
      req.user.monthlyScans = (req.user.monthlyScans || 0) + 1;
      await req.user.save();
      return next();
    }
    const guestCount = parseInt(req.headers["x-guest-scans"] || "0", 10);
    if (guestCount >= 2) {
      Analytics.create({
        event: "scan_gate_hit",
        sessionId: req.headers["x-session-id"],
        metadata: { ip: req.ip, userAgent: req.headers["user-agent"] },
      }).catch(() => {});
      return res.status(403).json({
        error: "You have used your 2 free scans. Sign up free to unlock 50 scans/month.",
        code: "GUEST_LIMIT_REACHED",
        signupUrl: "/register",
      });
    }
    next();
  } catch (e) {
    console.error("ScanGate error:", e);
    next();
  }
};
