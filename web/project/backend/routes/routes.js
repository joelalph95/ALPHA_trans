const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// Lister toutes les routes (avec noms des villes)
router.get('/', authenticate, async (req, res) => {
  try {
    const [routes] = await pool.query(`
      SELECT r.id, r.distance, r.etat, r.trafic,
             vd.nom AS ville_depart, va.nom AS ville_arrivee,
             r.ville_depart_id, r.ville_arrivee_id
      FROM Routes r
      JOIN Villes vd ON r.ville_depart_id = vd.id
      JOIN Villes va ON r.ville_arrivee_id = va.id
      ORDER BY vd.nom, va.nom
    `);
    res.json(routes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Ajouter une route (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { ville_depart_id, ville_arrivee_id, distance, etat, trafic } = req.body;
  if (!ville_depart_id || !ville_arrivee_id || !distance) {
    return res.status(400).json({ error: 'ville_depart_id, ville_arrivee_id et distance requis.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO Routes (ville_depart_id, ville_arrivee_id, distance, etat, trafic) VALUES (?, ?, ?, ?, ?)',
      [ville_depart_id, ville_arrivee_id, distance, etat || 'ouverte', trafic || 1]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Modifier une route (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { distance, etat, trafic } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE Routes SET distance = ?, etat = ?, trafic = ? WHERE id = ?',
      [distance, etat, trafic, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Route non trouvée.' });
    res.json({ message: 'Route modifiée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Supprimer une route (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Routes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Route non trouvée.' });
    res.json({ message: 'Route supprimée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;