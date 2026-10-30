const express    = require("express");
const router     = express.Router();
const crypto     = require("crypto");
const Subscriber = require("../models/Subscriber");
const authMiddleware = require("../middleware/auth");

// ── POST /api/subscribe  (landing page email capture) ─────────────────────────
router.post("/", async (req, res) => {
  try {
    const { email, source = "landing_page", prefs = {} } = req.body;
    if (!email) return res.status(400).json({ error: "Email required." });

    const confirmToken = crypto.randomBytes(32).toString("hex");
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.unsubscribed) {
        existing.unsubscribed = false;
        existing.confirmToken = confirmToken;
        await existing.save();
        return res.json({ message: "Welcome back! Check your email to confirm." });
      }
      return res.json({ message: "You are already subscribed." });
    }

    await Subscriber.create({ email, source, prefs, confirmToken });

    // Send double opt-in confirmation
    const { sendEmail } = require("../services/email");
    const link = `${process.env.FRONTEND_URL}/confirm-subscription?token=${confirmToken}`;
    sendEmail({
      to: email,
      subject: "Confirm your NexGuard AI subscription",
      html: `<div style="font-family:Arial;background:#01050a;color:#b8d0e0;padding:28px;max-width:540px;margin:0 auto">
        <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:4px">
          NEX<span style="color:#00e87a">GUARD</span> AI
        </div>
        <h2 style="color:#fff;font-size:18px">One click to confirm</h2>
        <p>Click below to confirm your subscription to NexGuard AI security updates, new tool announcements, and breach alerts.</p>
        <a href="${link}" style="display:inline-block;background:#00e87a;color:#000;font-weight:700;padding:12px 28px;text-decoration:none;margin:16px 0">
          Confirm Subscription →
        </a>
        <p style="font-size:11px;color:#2a4055">If you did not sign up, ignore this email. No further action needed.</p>
      </div>`,
    }).catch(console.error);

    res.status(201).json({ message: "Check your email to confirm your subscription." });
  } catch (e) {
    if (e.code === 11000) return res.json({ message: "You are already subscribed." });
    res.status(500).json({ error: "Subscription failed." });
  }
});

// ── GET /api/subscribe/confirm?token=xxx ─────────────────────────────────────
router.get("/confirm", async (req, res) => {
  try {
    const { token } = req.query;
    const sub = await Subscriber.findOne({ confirmToken: token });
    if (!sub) return res.status(400).json({ error: "Invalid or expired confirmation link." });
    sub.confirmed    = true;
    sub.confirmToken = undefined;
    await sub.save();
    res.json({ message: "Subscription confirmed! You will receive security updates from NexGuard AI." });
  } catch (e) {
    res.status(500).json({ error: "Confirmation failed." });
  }
});

// ── GET /api/subscribe/unsubscribe?email=xxx ─────────────────────────────────
router.get("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required." });
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { unsubscribed: true }
    );
    res.json({ message: "You have been unsubscribed." });
  } catch (e) {
    res.status(500).json({ error: "Unsubscribe failed." });
  }
});

// ── GET /api/subscribe/list  (admin only) ────────────────────────────────────
router.get("/list", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Admin access required." });
    const subs = await Subscriber.find({ confirmed: true, unsubscribed: false })
      .sort({ createdAt: -1 }).lean();
    res.json({ total: subs.length, subscribers: subs });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch subscribers." });
  }
});

module.exports = router;
