const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "zenai_jwt_secret_university_2026";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch {
    return res.status(403).json({ success: false, message: "Invalid or expired token." });
  }
}

module.exports = { authenticateToken };
