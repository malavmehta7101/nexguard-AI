const jwt  = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "nexguard-dev-secret-change-in-prod";

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ error: "No token provided." });
    const token   = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "User not found." });
    req.user = user;
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError")
      return res.status(401).json({ error: "Session expired. Please log in again." });
    return res.status(401).json({ error: "Invalid token." });
  }
};
