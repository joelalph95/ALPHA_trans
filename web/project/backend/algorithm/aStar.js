const { haversine } = require('../utils/helpers');

function aStarOptimized(graph, startId, goalId, cityCoords) {

  // Si départ = arrivée
  if (startId == goalId) {
    return {
      path: [parseInt(startId)],
      distance_km: 0,
      temps_minutes: 0,
      temps_heures: 0,
      temps_minutes_restantes: 0,
      cout_Ar: 0
    };
  }

  /**
   * Calcule la vitesse réelle en fonction de l'état de la route et du trafic
   * Vitesses réalistes pour Madagascar :
   * - Route ouverte : 50-60 km/h sur route nationale
   * - Route dégradée : 30-40 km/h
   * - Route mauvaise : 15-25 km/h
   */
  function getVitesse(etat, trafic) {
    // Vitesses de base réalistes (km/h)
    let vitesseBase;
    switch (etat) {
      case 'ouverte':   vitesseBase = 55; break;  // Route nationale standard
      case 'degradee':  vitesseBase = 35; break;  // Route avec nids-de-poule
      case 'mauvaise':  vitesseBase = 20; break;  // Piste ou route très dégradée
      case 'fermee':    vitesseBase = 0;  break;  // Route fermée
      default:          vitesseBase = 40; break;
    }
    
    // Coefficient de trafic (plus le trafic est élevé, plus on ralentit)
    // trafic: 1 = fluide, 2 = normal, 3 = dense, 4 = très dense, 5 = bouchon
    const coeffTrafic = {
      1: 1.0,   // Fluide : vitesse normale
      2: 0.85,  // Normal : léger ralentissement
      3: 0.65,  // Dense : ralentissement significatif
      4: 0.45,  // Très dense : très lent
      5: 0.25   // Bouchon : presque à l'arrêt
    };
    
    const facteur = coeffTrafic[trafic] || 0.65;
    let vitesse = vitesseBase * facteur;
    
    // Vitesse minimale de 5 km/h (pour ne pas bloquer l'algorithme)
    return Math.max(vitesse, 5);
  }

  /**
   * Calcule le temps de parcours en minutes
   * @param {number} distance - Distance en kilomètres
   * @param {string} etat - État de la route ('ouverte', 'degradee', 'mauvaise', 'fermee')
   * @param {number} trafic - Niveau de trafic (1 à 5)
   * @returns {number} Temps en minutes
   */
  function calculerTemps(distance, etat, trafic) {
    if (etat === 'fermee' || distance <= 0) return Infinity;
    
    const vitesse = getVitesse(etat, trafic);
    if (vitesse <= 0) return Infinity;
    
    // Temps en minutes = (distance en km / vitesse en km/h) * 60
    const tempsMinutes = (distance / vitesse) * 60;
    
    // Arrondir à 1 minute près (éviter les temps trop précis)
    return Math.max(Math.round(tempsMinutes), 1);
  }

  /**
   * Heuristique pour A* : estime le temps restant en ligne droite
   * Utilise une vitesse optimiste de 60 km/h pour la heuristique
   */
  function heuristiqueTemps(lat1, lon1, lat2, lon2) {
    const distanceKm = haversine(lat1, lon1, lat2, lon2);
    // Vitesse heuristique optimiste (plus rapide que la réalité pour garantir l'admissibilité)
    const VITESSE_HEURISTIQUE = 65; // km/h
    const tempsMinutes = (distanceKm / VITESSE_HEURISTIQUE) * 60;
    return tempsMinutes;
  }

  // Initialisation des structures de données
  const openSet = new Set([startId]);
  const cameFrom = {};
  const gScore = {};
  const fScore = {};

  // Récupérer tous les nœuds du graphe
  const allNodes = Object.keys(graph);
  for (const nodeId of allNodes) {
    gScore[nodeId] = Infinity;
    fScore[nodeId] = Infinity;
  }

  gScore[startId] = 0;
  fScore[startId] = heuristiqueTemps(
    cityCoords[startId].lat, cityCoords[startId].lon,
    cityCoords[goalId].lat, cityCoords[goalId].lon
  );

  let iterations = 0;
  const MAX_ITERATIONS = 1000; // Sécurité contre les boucles infinies

  while (openSet.size > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    
    // Trouver le nœud avec le fScore minimum dans openSet
    let current = null;
    let minF = Infinity;
    for (const id of openSet) {
      if (fScore[id] < minF) {
        minF = fScore[id];
        current = id;
      }
    }

    if (current === null) break;

    // Arrivé au but
    if (current == goalId) {
      // Reconstruire le chemin
      const path = [];
      let tmp = goalId;
      while (tmp !== undefined) {
        path.unshift(parseInt(tmp));
        tmp = cameFrom[tmp];
      }

      // Calculer la distance totale
      let distanceTotale = 0;
      let tempsTotal = 0;
      
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const edge = (graph[from] || []).find(e => e.id == to);
        if (edge) {
          distanceTotale += edge.distance;
          // Recalculer le temps pour chaque segment (plus précis)
          const segmentTime = calculerTemps(edge.distance, edge.etat, edge.trafic);
          tempsTotal += segmentTime;
        }
      }

      const tempsHeures = Math.floor(tempsTotal / 60);
      const tempsMinutesRestantes = Math.round(tempsTotal % 60);
      
      // Coût estimé : 300 Ar par kilomètre (tarif moyen à Madagascar)
      const coutEstime = Math.round(distanceTotale * 300);

      console.log(`✅ A* - Chemin trouvé: ${path.map(id => cityCoords[id]?.nom || id).join(' → ')}`);
      console.log(`   Distance: ${distanceTotale.toFixed(1)} km, Temps: ${tempsHeures}h${tempsMinutesRestantes}min, Coût: ${coutEstime} Ar`);

      return {
        path: path,
        distance_km: Math.round(distanceTotale * 100) / 100,
        temps_minutes: Math.round(tempsTotal),
        temps_heures: tempsHeures,
        temps_minutes_restantes: tempsMinutesRestantes,
        cout_Ar: coutEstime
      };
    }

    openSet.delete(current);

    // Explorer les voisins
    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      // Vérifier que le voisin existe dans cityCoords
      if (!cityCoords[neighbor.id]) continue;
      
      const tempsRoute = calculerTemps(neighbor.distance, neighbor.etat, neighbor.trafic);
      if (tempsRoute === Infinity) continue;

      const tentativeG = gScore[current] + tempsRoute;

      if (tentativeG < gScore[neighbor.id]) {
        cameFrom[neighbor.id] = current;
        gScore[neighbor.id] = tentativeG;
        
        // Calculer l'heuristique pour le voisin
        const heuristique = heuristiqueTemps(
          cityCoords[neighbor.id].lat, cityCoords[neighbor.id].lon,
          cityCoords[goalId].lat, cityCoords[goalId].lon
        );
        fScore[neighbor.id] = tentativeG + heuristique;
        
        openSet.add(neighbor.id);
      }
    }
  }

  // Aucun chemin trouvé
  console.error(`❌ A* - Aucun chemin trouvé entre ${startId} et ${goalId} après ${iterations} itérations`);
  return null;
}

module.exports = aStarOptimized;