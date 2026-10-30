// Attaches req.user if token present, but does NOT block if missing
const jwt  = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "nexguard-dev-secret-change-in-prod";

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return next();
    const token   = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
  } catch (e) { /* ignore invalid tokens */ }
  next();
};
