const db = require('../config/database');
const { calculerItineraireOptimal } = require('../algorithms/aStar');

// Fonction pour convertir un nom de ville en ID
async function obtenirIdVilleParNom(nomVille) {
    const [villes] = await db.query('SELECT * FROM villes WHERE LOWER(nom) = LOWER(?)', [nomVille.trim()]);
    return villes.length > 0 ? villes[0].id : null;
}

// Fonction pour obtenir toutes les villes (pour l'algorithme)
async function obtenirToutesVilles() {
    const [villes] = await db.query('SELECT * FROM villes');
    return villes;
}

// Fonction pour valider les villes et retourner les IDs
async function validerEtConvertirVilles(villeDepart, villeArrivee) {
    const departId = await obtenirIdVilleParNom(villeDepart);
    const arriveeId = await obtenirIdVilleParNom(villeArrivee);
    
    if (!departId) {
        throw new Error(`Ville de départ "${villeDepart}" non trouvée. Villes disponibles: Antananarivo, Antsirabe, Fianarantsoa, Toamasina, Mahajanga`);
    }
    if (!arriveeId) {
        throw new Error(`Ville d'arrivée "${villeArrivee}" non trouvée. Villes disponibles: Antananarivo, Antsirabe, Fianarantsoa, Toamasina, Mahajanga`);
    }
    if (departId === arriveeId) {
        throw new Error("La ville de départ et d'arrivée doivent être différentes");
    }
    
    return { departId, arriveeId };
}

class TrajetController {
    static async rechercher(req, res) {
        const { villeDepart, villeArrivee, dateDepart } = req.body;
        
        try {
            // Valider les noms de villes et obtenir les IDs
            const { departId, arriveeId } = await validerEtConvertirVilles(villeDepart, villeArrivee);
            
            // Récupérer les villes pour l'algorithme
            const villes = await obtenirToutesVilles();
            const [routes] = await db.query('SELECT * FROM routes');
            
            // Appeler l'algorithme A* avec les IDs
            const resultat = await calculerItineraireOptimal(
                departId, 
                arriveeId, 
                villes, 
                routes
            );
            
            if (resultat) {
                const cheminComplete = [];
                for (const villeId of resultat.path) {
                    const [ville] = await db.query('SELECT * FROM villes WHERE id = ?', [villeId]);
                    if (ville.length > 0) {
                        cheminComplete.push(ville[0]);
                    }
                }
                
                // Récupérer les ids de villes du chemin pour filtrer les trajets
                const villeIds = resultat.path;
                
                // Filtrer les trajets qui passent par les villes de l'itinéraire
                const [trajetsDisponibles] = await db.query(`
                    SELECT t.*, v.immatriculation, v.capacite_max, v.places_occupees
                    FROM trajets t
                    JOIN vehicules v ON t.vehicule_id = v.id
                    WHERE DATE(t.date_depart) = DATE(?)
                    AND t.places_disponibles > 0
                    AND t.statut != 'Annule'
                `, [dateDepart]);
                
                return res.json({
                    success: true,
                    itineraire: {
                        chemin: cheminComplete,
                        distanceTotale: resultat.distance,
                        dureeEstimee: resultat.distance * 1.2,
                        trajetsDisponibles
                    }
                });
            }
            
            res.json({
                success: false,
                message: "Aucun itinéraire trouvé entre ces villes. Essayez une autre combinaison."
            });
        } catch (error) {
            console.error('Erreur recherche trajet:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async consulterItineraire(req, res) {
        const { id } = req.params;
        
        try {
            const [trajet] = await db.query(`
                SELECT t.*, v.immatriculation, v.chauffeur_nom
                FROM trajets t
                JOIN vehicules v ON t.vehicule_id = v.id
                WHERE t.id = ?
            `, [id]);
            
            if (trajet.length > 0) {
                return res.json({
                    success: true,
                    trajet: trajet[0],
                    itineraire: JSON.parse(trajet[0].itineraire || '[]')
                });
            }
            
            res.json({ success: false, message: "Trajet non trouvé" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = TrajetController;
