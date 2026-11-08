const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// Mise à jour du niveau de trafic d'une route
router.put('/:route_id', authenticate, authorize('admin', 'cooperative'), async (req, res) => {
  const { niveau_trafic } = req.body;
  if (niveau_trafic < 1 || niveau_trafic > 5) {
    return res.status(400).json({ error: 'niveau_trafic doit être entre 1 et 5.' });
  }
  try {
    const [result] = await pool.query('UPDATE Routes SET trafic = ? WHERE id = ?', [niveau_trafic, req.params.route_id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Route non trouvée.' });

    // Enregistrer dans l'historique
    await pool.query('INSERT INTO Historique_Trafic (route_id, niveau_trafic) VALUES (?, ?)', [req.params.route_id, niveau_trafic]);

    res.json({ message: 'Trafic mis à jour.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Historique du trafic pour une route
router.get('/historique/:route_id', authenticate, authorize('admin', 'cooperative'), async (req, res) => {
  try {
    const [historique] = await pool.query(
      'SELECT * FROM Historique_Trafic WHERE route_id = ? ORDER BY date_heure DESC',
      [req.params.route_id]
    );
    res.json(historique);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;