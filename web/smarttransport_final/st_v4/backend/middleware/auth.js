const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "smarttransport2035_secret";

// Génère un token JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// Middleware : vérifie le token (routes protégées)
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Token manquant. Connectez-vous d'abord." });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Token invalide ou expiré. Reconnectez-vous." });
  }
}

// Middleware : vérifie le rôle admin
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Accès réservé aux administrateurs." });
  }
  next();
}

module.exports = { generateToken, requireAuth, requireAdmin };
