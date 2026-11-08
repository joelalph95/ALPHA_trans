/**
 * Algorithme du sac à dos (0/1 Knapsack).
 * @param {Array} items - tableau d'objets { id, poids, valeur }
 * @param {number} capacite - capacité maximale
 * @returns {Array} tableau d'ids des éléments sélectionnés
 */
function knapsack(items, capacite) {
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacite + 1).fill(0));
  const keep = Array.from({ length: n + 1 }, () => Array(capacite + 1).fill(false));

  for (let i = 1; i <= n; i++) {
    const { poids, valeur } = items[i - 1];
    for (let w = 0; w <= capacite; w++) {
      if (poids <= w) {
        const include = valeur + dp[i - 1][w - poids];
        const exclude = dp[i - 1][w];
        if (include > exclude) {
          dp[i][w] = include;
          keep[i][w] = true;
        } else {
          dp[i][w] = exclude;
        }
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Reconstruction de la solution
  const selectedIds = [];
  let w = capacite;
  for (let i = n; i >= 1; i--) {
    if (keep[i][w]) {
      selectedIds.push(items[i - 1].id);
      w -= items[i - 1].poids;
    }
  }
  return selectedIds;
}

module.exports = knapsack;