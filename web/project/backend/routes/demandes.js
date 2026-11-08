const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// ============================================================
// POST /api/demandes
// Passager : créer une demande
// ============================================================
router.post('/', authenticate, authorize('passager'), async (req, res) => {
  const { ville_depart_id, ville_arrivee_id } = req.body;
  if (!ville_depart_id || !ville_arrivee_id) {
    return res.status(400).json({ error: 'Les deux villes sont obligatoires.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO Demandes (passager_id, ville_depart_id, ville_arrivee_id) VALUES (?, ?, ?)',
      [req.user.id, ville_depart_id, ville_arrivee_id]
    );
    res.status(201).json({ id: result.insertId, statut: 'en_attente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================================
// GET /api/demandes/mes-demandes
// Passager : consulter ses propres demandes
// ============================================================
router.get('/mes-demandes', authenticate, authorize('passager'), async (req, res) => {
  try {
    const [demandes] = await pool.query(
      `SELECT d.*, vd.nom AS ville_depart, va.nom AS ville_arrivee
       FROM Demandes d
       JOIN Villes vd ON d.ville_depart_id = vd.id
       JOIN Villes va ON d.ville_arrivee_id = va.id
       WHERE d.passager_id = ?
       ORDER BY d.date_demande DESC`,
      [req.user.id]
    );
    res.json(demandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================================
// GET /api/demandes
// Admin, Coopérative, Chauffeur : lister toutes les demandes en attente
// ============================================================
router.get('/', authenticate, authorize('admin', 'cooperative', 'chauffeur'), async (req, res) => {
  try {
    const [demandes] = await pool.query(
      `SELECT d.id, d.date_demande, d.statut,
              u.nom AS passager,
              vd.nom AS ville_depart, va.nom AS ville_arrivee
       FROM Demandes d
       JOIN Utilisateurs u ON d.passager_id = u.id
       JOIN Villes vd ON d.ville_depart_id = vd.id
       JOIN Villes va ON d.ville_arrivee_id = va.id
       WHERE d.statut = 'en_attente'
       ORDER BY d.date_demande`
    );
    res.json(demandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================================
// PATCH /api/demandes/:id/accepter
// Chauffeur, Coopérative, Admin : accepter une demande
// ============================================================
router.patch('/:id/accepter', authenticate, authorize('chauffeur', 'cooperative', 'admin'), async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE Demandes SET statut = "acceptee" WHERE id = ? AND statut = "en_attente"',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Demande introuvable ou déjà traitée.' });
    }
    res.json({ message: '✅ Demande acceptée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================================
// PATCH /api/demandes/:id/refuser
// Chauffeur, Coopérative, Admin : refuser une demande
// ============================================================
router.patch('/:id/refuser', authenticate, authorize('chauffeur', 'cooperative', 'admin'), async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE Demandes SET statut = "refusee" WHERE id = ? AND statut = "en_attente"',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Demande introuvable ou déjà traitée.' });
    }
    res.json({ message: '❌ Demande refusée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================================
// DELETE /api/demandes/:id
// Passager : annuler sa propre demande (optionnel)
// ============================================================
router.delete('/:id', authenticate, authorize('passager'), async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM Demandes WHERE id = ? AND passager_id = ? AND statut = "en_attente"',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Demande introuvable ou déjà traitée.' });
    }
    res.json({ message: 'Demande annulée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;