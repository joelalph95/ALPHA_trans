class Graph {
    constructor() {
        this.nodes = new Map(); // id -> {x, y, name}
        this.edges = new Map(); // id -> [{to, distance, time}]
    }

    addNode(id, x, y, name) {
        this.nodes.set(id, { x, y, name });
        this.edges.set(id, []);
    }

    addEdge(from, to, distance, time) {
        this.edges.get(from).push({ to, distance, time });
        this.edges.get(to).push({ to: from, distance, time });
    }

    heuristic(a, b) {
        const nodeA = this.nodes.get(a);
        const nodeB = this.nodes.get(b);
        return Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);
    }

    aStar(start, end) {
        const openSet = new Set([start]);
        const cameFrom = new Map();
        
        const gScore = new Map();
        const fScore = new Map();
        
        gScore.set(start, 0);
        fScore.set(start, this.heuristic(start, end));
        
        while (openSet.size > 0) {
            let current = null;
            let lowestF = Infinity;
            
            for (let node of openSet) {
                const f = fScore.get(node) || Infinity;
                if (f < lowestF) {
                    lowestF = f;
                    current = node;
                }
            }
            
            if (current === end) {
                const path = [];
                let temp = current;
                while (cameFrom.has(temp)) {
                    path.unshift(temp);
                    temp = cameFrom.get(temp);
                }
                path.unshift(start);
                return { path, distance: gScore.get(end) };
            }
            
            openSet.delete(current);
            
            const neighbors = this.edges.get(current) || [];
            for (const neighbor of neighbors) {
                const tentativeG = (gScore.get(current) || 0) + neighbor.distance;
                
                if (tentativeG < (gScore.get(neighbor.to) || Infinity)) {
                    cameFrom.set(neighbor.to, current);
                    gScore.set(neighbor.to, tentativeG);
                    fScore.set(neighbor.to, tentativeG + this.heuristic(neighbor.to, end));
                    
                    if (!openSet.has(neighbor.to)) {
                        openSet.add(neighbor.to);
                    }
                }
            }
        }
        
        return null;
    }
}

async function calculerItineraireOptimal(startCityId, endCityId, villes, routes) {
    const graph = new Graph();
    
    // Ajouter les villes comme nœuds
    villes.forEach(ville => {
        graph.addNode(ville.id, ville.coord_x, ville.coord_y, ville.nom);
    });
    
    // Ajouter les routes comme arêtes
    routes.forEach(route => {
        const traficMultiplier = 1 + (route.trafic || 0) * 0.3;
        const tempsModifie = route.temps_moyen * traficMultiplier;
        graph.addEdge(route.ville_depart, route.ville_arrivee, route.distance_km, tempsModifie);
    });
    
    return graph.aStar(startCityId, endCityId);
}

module.exports = { calculerItineraireOptimal, Graph };
