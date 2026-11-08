const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// Créer un planning
router.post('/', authenticate, authorize('cooperative', 'admin'), async (req, res) => {
  const { cooperative_id, vehicule_id, chauffeur_id, ville_depart_id, ville_arrivee_id, date_depart } = req.body;
  if (!cooperative_id || !vehicule_id || !chauffeur_id || !ville_depart_id || !ville_arrivee_id || !date_depart) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO Plannings (cooperative_id, vehicule_id, chauffeur_id, ville_depart_id, ville_arrivee_id, date_depart)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cooperative_id, vehicule_id, chauffeur_id, ville_depart_id, ville_arrivee_id, date_depart]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Lister les plannings (filtré par rôle)
router.get('/', authenticate, authorize('cooperative', 'admin', 'chauffeur'), async (req, res) => {
  try {
    let query = `
      SELECT p.*, v.immatriculation, u.nom AS chauffeur, 
             vd.nom AS ville_dep, va.nom AS ville_arr, c.nom AS cooperative
      FROM Plannings p
      JOIN Vehicules v ON p.vehicule_id = v.id
      JOIN Utilisateurs u ON p.chauffeur_id = u.id
      JOIN Villes vd ON p.ville_depart_id = vd.id
      JOIN Villes va ON p.ville_arrivee_id = va.id
      LEFT JOIN Cooperatives c ON p.cooperative_id = c.id
    `;
    const params = [];
    if (req.user.role === 'chauffeur') {
      query += ' WHERE p.chauffeur_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY p.date_depart DESC';
    const [plannings] = await pool.query(query, params);
    res.json(plannings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Mettre à jour le statut d'un planning
router.patch('/:id/statut', authenticate, authorize('cooperative', 'admin', 'chauffeur'), async (req, res) => {
  const { statut } = req.body;
  const validStatus = ['planifie', 'en_cours', 'termine', 'annule'];
  if (!validStatus.includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide.' });
  }
  try {
    const [result] = await pool.query('UPDATE Plannings SET statut = ? WHERE id = ?', [statut, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Planning non trouvé.' });
    res.json({ message: 'Statut mis à jour.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;