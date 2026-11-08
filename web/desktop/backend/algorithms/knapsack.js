function optimiserRemplissage(vehiculeCapacite, passagers, coutTrajet) {
    // nom: {poids (temps attente), valeur (prix)}
    const n = passagers.length;
    const dp = Array(n + 1).fill().map(() => Array(vehiculeCapacite + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= vehiculeCapacite; w++) {
            const passager = passagers[i - 1];
            if (passager.poids <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    dp[i - 1][w - passager.poids] + passager.valeur
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    
    const selectedPassagers = [];
    let w = vehiculeCapacite;
    for (let i = n; i > 0 && w > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            selectedPassagers.push(passagers[i - 1]);
            w -= passagers[i - 1].poids;
        }
    }
    
    return {
        revenueTotal: dp[n][vehiculeCapacite] - coutTrajet,
        selectedPassagers,
        placesOccupees: vehiculeCapacite - w
    };
}

module.exports = { optimiserRemplissage };
