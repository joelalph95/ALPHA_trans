const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// Voir tous les logs (admin seulement)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT l.*, u.nom AS utilisateur
       FROM Logs_Modifications l
       JOIN Utilisateurs u ON l.utilisateur_id = u.id
       ORDER BY l.date_modification DESC
       LIMIT 100`
    );
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;