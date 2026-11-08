const express = require('express');
const router = express.Router();
const pool = require('../db');
const aStarOptimized = require('../algorithm/aStar');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/itinerary
 * Calcule l'itinéraire optimal en TEMPS (pas en distance).
 */
router.post('/', authenticate, async (req, res) => {
  const { departId, arriveeId } = req.body;

  console.log('=== NOUVELLE REQUÊTE ITINÉRAIRE ===');
  console.log('departId:', departId, 'arriveeId:', arriveeId);

  if (!departId || !arriveeId) {
    return res.status(400).json({ error: 'departId et arriveeId requis.' });
  }

  try {
    // 1. Récupérer toutes les villes
    const [villes] = await pool.query('SELECT id, nom, latitude, longitude FROM Villes');
    console.log('Villes trouvées:', villes.length);

    const cityMap = {};    // id → nom
    const cityCoords = {}; // id → { lat, lon }
    for (const v of villes) {
      cityMap[v.id] = v.nom;
      cityCoords[v.id] = { lat: v.latitude, lon: v.longitude };
    }

    // Vérifier que les villes existent
    if (!(departId in cityCoords)) {
      return res.status(404).json({ error: `Ville de départ (ID ${departId}) introuvable.` });
    }
    if (!(arriveeId in cityCoords)) {
      return res.status(404).json({ error: `Ville d'arrivée (ID ${arriveeId}) introuvable.` });
    }

    console.log('Ville départ:', cityMap[departId]);
    console.log('Ville arrivée:', cityMap[arriveeId]);

    // 2. Récupérer toutes les routes (sauf fermées)
    const [routes] = await pool.query(
      `SELECT ville_depart_id, ville_arrivee_id, distance, etat, trafic 
       FROM Routes 
       WHERE etat != 'fermee'`
    );
    console.log('Routes trouvées:', routes.length);

    // Afficher les routes pour debug
    routes.forEach(r => {
      console.log(`  ${cityMap[r.ville_depart_id]} → ${cityMap[r.ville_arrivee_id]} : ${r.distance}km, état: ${r.etat}, trafic: ${r.trafic}`);
    });

    // 3. Construire le graphe enrichi
    const graph = {};
    for (const v of villes) {
      graph[v.id] = [];
    }
    for (const r of routes) {
      graph[r.ville_depart_id].push({
        id: r.ville_arrivee_id,
        distance: r.distance,
        etat: r.etat,
        trafic: r.trafic
      });
    }

    console.log('Graphe construit. Noeuds:', Object.keys(graph).length);
    console.log('Voisins du départ:', graph[departId]?.length || 0);

    // 4. Appeler A* optimisé
    const result = aStarOptimized(graph, parseInt(departId), parseInt(arriveeId), cityCoords);

    console.log('Résultat A*:', result);

    if (!result) {
      return res.status(404).json({
        error: 'Aucun itinéraire trouvé. Vérifiez que les villes sont connectées par des routes non fermées.'
      });
    }

    // 5. Formater la réponse
    const cheminNoms = result.path.map(id => cityMap[id]);

    const response = {
      chemin: cheminNoms,
      chemin_ids: result.path,
      distance_totale_km: result.distance_km,
      temps_estime: {
        total_minutes: result.temps_minutes,
        heures: result.temps_heures,
        minutes: result.temps_minutes_restantes,
        affichage: `${result.temps_heures}h ${String(result.temps_minutes_restantes).padStart(2, '0')}min`
      },
      cout_estime_Ar: result.cout_Ar,
      optimisation: 'temps'
    };

    console.log('Réponse envoyée:', JSON.stringify(response, null, 2));

    res.json(response);

  } catch (err) {
    console.error('Erreur calcul itinéraire:', err);
    res.status(500).json({ error: 'Erreur serveur lors du calcul.' });
  }
});

module.exports = router;