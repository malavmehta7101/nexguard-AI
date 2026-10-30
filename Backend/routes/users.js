const express = require("express");
const router  = express.Router();
const User    = require("../models/User");
const Scan    = require("../models/Scan");
const auth    = require("../middleware/auth");

// GET /api/users/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const [user, scanStats] = await Promise.all([
      User.findById(req.user._id),
      Scan.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: "$tool", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);
    res.json({ user: user.toPublic(), scanStats });
  } catch (e) { res.status(500).json({ error: "Failed to load profile." }); }
});

// PATCH /api/users/profile
router.patch("/profile", auth, async (req, res) => {
  try {
    const allowed = ["displayName", "emailPrefs"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
    res.json({ user: user.toPublic() });
  } catch (e) { res.status(500).json({ error: "Failed to update profile." }); }
});

// DELETE /api/users/account
router.delete("/account", auth, async (req, res) => {
  try {
    await Promise.all([
      User.findByIdAndDelete(req.user._id),
      Scan.deleteMany({ userId: req.user._id }),
    ]);
    res.json({ message: "Account deleted successfully." });
  } catch (e) { res.status(500).json({ error: "Failed to delete account." }); }
});

// GET /api/users/all  (admin)
router.get("/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only." });
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const [users, total] = await Promise.all([
      User.find().select("-password -verifyToken -resetToken")
          .sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).lean(),
      User.countDocuments(),
    ]);
    res.json({ users, total, page, pages: Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ error: "Failed to fetch users." }); }
});

module.exports = router;
