/**
 * SmartTransport 2035 - Algorithme Knapsack
 * Optimise le remplissage du taxi-brousse
 */

/**
 * Résout le problème du sac à dos (0/1 Knapsack) par programmation dynamique
 *
 * Chaque "passager" a un poids (nombre de bagages/place) et une valeur (tarif).
 * On maximise le revenu total sous contrainte de capacité du véhicule.
 *
 * @param {number} capacity        - Capacité max du véhicule (nombre de places)
 * @param {Array}  passengers      - [{id, name, weight, value, destination}]
 * @returns {Object}               - { selected, totalValue, totalWeight, savings }
 */
function knapsack(capacity, passengers) {
  const startTime = Date.now();
  const n = passengers.length;

  // Table DP : dp[i][w] = valeur max avec i premiers passagers et capacité w
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const p = passengers[i - 1];
    for (let w = 0; w <= capacity; w++) {
      if (p.weight <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - p.weight] + p.value);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Reconstruction des passagers sélectionnés
  const selected = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(passengers[i - 1]);
      w -= passengers[i - 1].weight;
    }
  }

  const totalValue = dp[n][capacity];
  const totalWeight = selected.reduce((sum, p) => sum + p.weight, 0);

  // Comparaison avec remplissage naïf (premier arrivé, premier servi)
  const naiveSelected = [];
  let naiveWeight = 0;
  let naiveValue = 0;
  for (const p of passengers) {
    if (naiveWeight + p.weight <= capacity) {
      naiveSelected.push(p);
      naiveWeight += p.weight;
      naiveValue += p.value;
    }
  }

  const executionTime = Date.now() - startTime;

  return {
    selected: selected.reverse(),
    totalValue,
    totalWeight,
    remainingCapacity: capacity - totalWeight,
    naiveValue,
    naiveSelected,
    savings: totalValue - naiveValue,
    gainPercent: naiveValue > 0 ? Math.round(((totalValue - naiveValue) / naiveValue) * 100) : 0,
    executionTime,
    algorithm: "Programmation dynamique O(n×W)",
  };
}

/**
 * Génère des passagers simulés pour les tests
 */
function generatePassengers(count = 12, seed = 42) {
  const destinations = ["Toamasina", "Mahajanga", "Fianarantsoa", "Morondava", "Ihosy"];
  const firstNames = ["Rakoto", "Rasoa", "Rabe", "Ravao", "Randria", "Ralala", "Rafara", "Ranja"];
  const passengers = [];

  for (let i = 0; i < count; i++) {
    // Poids : 1 = passager seul, 2 = avec bagages lourds
    const weight = Math.random() < 0.3 ? 2 : 1;
    // Tarif : distance simulée × taux
    const value = Math.floor(Math.random() * 15000) + 5000;
    passengers.push({
      id: `P${i + 1}`,
      name: firstNames[i % firstNames.length] + ` ${i + 1}`,
      weight,
      value,
      destination: destinations[i % destinations.length],
      baggages: weight === 2 ? "Bagages lourds" : "Léger",
    });
  }

  return passengers;
}

module.exports = { knapsack, generatePassengers };
