/**
 * SmartTransport 2035 - Algorithme A*
 * Calcule le chemin optimal entre deux villes
 */

class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  push(item, priority) {
    this.heap.push({ item, priority });
    this.heap.sort((a, b) => a.priority - b.priority);
  }

  pop() {
    return this.heap.shift()?.item;
  }

  isEmpty() {
    return this.heap.length === 0;
  }
}

/**
 * Heuristique : distance haversine entre deux villes (coordonnées géo)
 */
function haversineDistance(city1, city2) {
  const R = 6371;
  const dLat = ((city2.lat - city1.lat) * Math.PI) / 180;
  const dLng = ((city2.lng - city1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((city1.lat * Math.PI) / 180) *
      Math.cos((city2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * A* - Chemin optimal
 * @param {string} startId - ID ville départ
 * @param {string} goalId  - ID ville arrivée
 * @param {Object} data    - { cities, routes }
 * @param {number} trafficLevel - 0=normal, 1=modéré, 2=dense
 * @returns {Object} résultat avec chemin, distance, temps, coût
 */
function astar(startId, goalId, data, trafficLevel = 0) {
  const startTime = Date.now();

  const { cities, routes } = data;
  const cityMap = {};
  cities.forEach((c) => (cityMap[c.id] = c));

  // Multiplicateurs de trafic
  const trafficMultipliers = [1.0, 1.3, 1.7];
  const trafficMult = trafficMultipliers[trafficLevel] || 1.0;

  // Construction du graphe
  const graph = {};
  cities.forEach((c) => (graph[c.id] = []));

  routes.forEach((r) => {
    if (r.status === "open") {
      const effectiveTime = r.time * r.trafficFactor * trafficMult;
      graph[r.from].push({
        to: r.to,
        distance: r.distance,
        time: effectiveTime,
        fuel: r.fuel,
        baseTime: r.time,
      });
      graph[r.to].push({
        to: r.from,
        distance: r.distance,
        time: effectiveTime,
        fuel: r.fuel,
        baseTime: r.time,
      });
    }
  });

  // A*
  const open = new PriorityQueue();
  const gScore = {}; // coût réel
  const fScore = {};
  const cameFrom = {};
  const timeScore = {};
  const fuelScore = {};

  cities.forEach((c) => {
    gScore[c.id] = Infinity;
    fScore[c.id] = Infinity;
    timeScore[c.id] = Infinity;
    fuelScore[c.id] = Infinity;
  });

  gScore[startId] = 0;
  timeScore[startId] = 0;
  fuelScore[startId] = 0;
  const hStart = haversineDistance(cityMap[startId], cityMap[goalId]);
  fScore[startId] = hStart;
  open.push(startId, fScore[startId]);

  while (!open.isEmpty()) {
    const current = open.pop();

    if (current === goalId) {
      // Reconstruction du chemin
      const path = [];
      let node = goalId;
      while (node !== undefined) {
        path.unshift(node);
        node = cameFrom[node];
      }

      const executionTime = Date.now() - startTime;

      return {
        found: true,
        path,
        pathNames: path.map((id) => cityMap[id]?.name || id),
        totalDistance: Math.round(gScore[goalId]),
        totalTime: Math.round(timeScore[goalId] * 10) / 10,
        totalFuel: Math.round(fuelScore[goalId]),
        executionTime,
        trafficLevel,
        nodesExplored: Object.values(gScore).filter((v) => v < Infinity).length,
      };
    }

    if (!graph[current]) continue;

    for (const neighbor of graph[current]) {
      const tentativeG = gScore[current] + neighbor.distance;

      if (tentativeG < gScore[neighbor.to]) {
        cameFrom[neighbor.to] = current;
        gScore[neighbor.to] = tentativeG;
        timeScore[neighbor.to] = timeScore[current] + neighbor.time;
        fuelScore[neighbor.to] = fuelScore[current] + neighbor.fuel;
        const h = haversineDistance(cityMap[neighbor.to], cityMap[goalId]);
        fScore[neighbor.to] = tentativeG + h;
        open.push(neighbor.to, fScore[neighbor.to]);
      }
    }
  }

  return { found: false, path: [], totalDistance: 0, totalTime: 0, totalFuel: 0 };
}

/**
 * Baseline : algorithme naïf (premier chemin trouvé, sans heuristique)
 */
function baseline(startId, goalId, data) {
  const startTime = Date.now();
  const { cities, routes } = data;

  const graph = {};
  cities.forEach((c) => (graph[c.id] = []));
  routes.forEach((r) => {
    if (r.status === "open") {
      graph[r.from].push({ to: r.to, distance: r.distance, time: r.time, fuel: r.fuel });
      graph[r.to].push({ to: r.from, distance: r.distance, time: r.time, fuel: r.fuel });
    }
  });

  // BFS simple
  const visited = new Set();
  const queue = [{ node: startId, path: [startId], dist: 0, time: 0, fuel: 0 }];

  while (queue.length > 0) {
    const { node, path, dist, time, fuel } = queue.shift();

    if (node === goalId) {
      return {
        found: true,
        path,
        pathNames: path.map((id) => cities.find((c) => c.id === id)?.name || id),
        totalDistance: Math.round(dist),
        totalTime: Math.round(time * 10) / 10,
        totalFuel: Math.round(fuel),
        executionTime: Date.now() - startTime,
        nodesExplored: visited.size,
      };
    }

    if (visited.has(node)) continue;
    visited.add(node);

    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor.to)) {
        queue.push({
          node: neighbor.to,
          path: [...path, neighbor.to],
          dist: dist + neighbor.distance,
          time: time + neighbor.time,
          fuel: fuel + neighbor.fuel,
        });
      }
    }
  }

  return { found: false };
}

module.exports = { astar, baseline };
