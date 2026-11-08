const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware pour vérifier le token JWT.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé. Token manquant.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré.' });
    }
    req.user = { id: decoded.id, role: decoded.role };
    next();
  });
};

/**
 * Middleware pour vérifier les rôles.
 * Usage: authorize('admin', 'cooperative')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Droits insuffisants pour cette action.' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };