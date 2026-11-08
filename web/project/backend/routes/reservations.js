const express = require('express');
const router = express.Router();
const pool = require('../db');
const knapsack = require('../algorithm/knapsack');
const { haversine } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * POST /api/reservations/optimize
 * Lance l'optimisation Knapsack pour un véhicule donné et un ensemble de demandes.
 */
router.post('/optimize', authenticate, authorize('cooperative', 'admin', 'chauffeur'), async (req, res) => {
  const { vehicule_id, demande_ids } = req.body;
  if (!vehicule_id || !demande_ids || !Array.isArray(demande_ids)) {
    return res.status(400).json({ error: 'vehicule_id et demande_ids (tableau) requis.' });
  }

  try {
    // Capacité du véhicule
    const [vehicules] = await pool.query('SELECT * FROM Vehicules WHERE id = ?', [vehicule_id]);
    if (vehicules.length === 0) return res.status(404).json({ error: 'Véhicule introuvable.' });
    const capacite = vehicules[0].capacite;

    // Récupérer les demandes correspondantes
    const placeholders = demande_ids.map(() => '?').join(',');
    const [demandes] = await pool.query(
      `SELECT d.*, 
              vd.latitude AS lat_dep, vd.longitude AS lon_dep,
              va.latitude AS lat_arr, va.longitude AS lon_arr
       FROM Demandes d
       JOIN Villes vd ON d.ville_depart_id = vd.id
       JOIN Villes va ON d.ville_arrivee_id = va.id
       WHERE d.id IN (${placeholders}) AND d.statut = 'en_attente'`,
      demande_ids
    );

    // Items pour Knapsack : poids = 1 (une place), valeur = prix estimé (distance * 150Ar)
    const items = demandes.map(d => ({
      id: d.id,
      poids: 1,
      valeur: Math.round(haversine(d.lat_dep, d.lon_dep, d.lat_arr, d.lon_arr) * 150)
    }));

    const selection = knapsack(items, capacite);

    // Chauffeur : si l'utilisateur est chauffeur, on l'assigne automatiquement, sinon null
    const chauffeur_id = req.user.role === 'chauffeur' ? req.user.id : null;

    const reservations = [];
    for (const demandeId of selection) {
      // Insérer la réservation
      const [res] = await pool.query(
        'INSERT INTO Reservations (demande_id, vehicule_id, chauffeur_id, date_depart, nombre_places) VALUES (?, ?, ?, NOW(), 1)',
        [demandeId, vehicule_id, chauffeur_id]
      );
      // Mettre à jour le statut de la demande
      await pool.query('UPDATE Demandes SET statut = "acceptee" WHERE id = ?', [demandeId]);
      reservations.push({ id: res.insertId, demande_id: demandeId });
    }

    res.json({
      vehicule_id,
      capacite_max: capacite,
      places_attribuees: reservations.length,
      reservations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Lister les réservations (chauffeur voit les siennes, coop/admin toutes)
router.get('/', authenticate, authorize('chauffeur', 'cooperative', 'admin'), async (req, res) => {
  try {
    let query = `
      SELECT r.*, u.nom AS passager, v.immatriculation, 
             vd.nom AS ville_dep, va.nom AS ville_arr
      FROM Reservations r
      JOIN Demandes d ON r.demande_id = d.id
      JOIN Utilisateurs u ON d.passager_id = u.id
      JOIN Vehicules v ON r.vehicule_id = v.id
      JOIN Villes vd ON d.ville_depart_id = vd.id
      JOIN Villes va ON d.ville_arrivee_id = va.id
    `;
    const params = [];
    if (req.user.role === 'chauffeur') {
      query += ' WHERE r.chauffeur_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY r.date_depart DESC';
    const [reservations] = await pool.query(query, params);
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;