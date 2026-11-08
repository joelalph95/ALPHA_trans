const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET toutes les villes (accessible à tous les utilisateurs authentifiés)
router.get('/', authenticate, async (req, res) => {
  try {
    const [villes] = await pool.query('SELECT id, nom, latitude, longitude FROM Villes ORDER BY nom');
    res.json(villes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST - Admin uniquement
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { nom, latitude, longitude } = req.body;
  if (!nom || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'nom, latitude, longitude requis.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO Villes (nom, latitude, longitude) VALUES (?, ?, ?)',
      [nom, latitude, longitude]
    );
    res.status(201).json({ id: result.insertId, nom, latitude, longitude });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT - Admin
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { nom, latitude, longitude } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE Villes SET nom = ?, latitude = ?, longitude = ? WHERE id = ?',
      [nom, latitude, longitude, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ville non trouvée.' });
    res.json({ message: 'Ville modifiée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE - Admin
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Villes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ville non trouvée.' });
    res.json({ message: 'Ville supprimée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;