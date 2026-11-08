const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// Liste des véhicules
router.get('/', authenticate, authorize('cooperative', 'admin', 'chauffeur'), async (req, res) => {
  try {
    const [vehicules] = await pool.query(
      'SELECT v.*, c.nom AS cooperative_nom FROM Vehicules v LEFT JOIN Cooperatives c ON v.cooperative_id = c.id'
    );
    res.json(vehicules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Ajouter un véhicule
router.post('/', authenticate, authorize('cooperative', 'admin'), async (req, res) => {
  const { immatriculation, capacite, carburant_max, cooperative_id } = req.body;
  if (!immatriculation || !capacite) {
    return res.status(400).json({ error: 'immatriculation et capacite obligatoires.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO Vehicules (immatriculation, capacite, carburant_max, cooperative_id) VALUES (?, ?, ?, ?)',
      [immatriculation, capacite, carburant_max || null, cooperative_id || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Immatriculation déjà existante.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Modifier un véhicule
router.put('/:id', authenticate, authorize('cooperative', 'admin'), async (req, res) => {
  const { immatriculation, capacite, carburant_max, cooperative_id } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE Vehicules SET immatriculation=?, capacite=?, carburant_max=?, cooperative_id=? WHERE id=?',
      [immatriculation, capacite, carburant_max, cooperative_id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Véhicule non trouvé.' });
    res.json({ message: 'Véhicule modifié.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Supprimer un véhicule
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Vehicules WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Véhicule non trouvé.' });
    res.json({ message: 'Véhicule supprimé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;