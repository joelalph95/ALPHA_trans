const db = require('../config/database');

class AdminController {
    static async mettreAJourTrafic(req, res) {
        const { routeId } = req.params;
        const { trafic, etat } = req.body;
        
        try {
            await db.query(
                'UPDATE routes SET trafic = ?, etat = ? WHERE id = ?',
                [trafic, etat, routeId]
            );
            
            res.json({
                success: true,
                message: "État du trafic mis à jour"
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async ajouterRoute(req, res) {
        const { villeDepart, villeArrivee, distanceKm, tempsMoyen } = req.body;
        
        try {
            // Vérifier que les villes existent
            const [villeD] = await db.query('SELECT id FROM villes WHERE id = ?', [villeDepart]);
            const [villeA] = await db.query('SELECT id FROM villes WHERE id = ?', [villeArrivee]);
            
            if (villeD.length === 0 || villeA.length === 0) {
                return res.json({ success: false, message: "Une ville n'existe pas" });
            }
            
            const [result] = await db.query(`
                INSERT INTO routes (ville_depart, ville_arrivee, distance_km, temps_moyen)
                VALUES (?, ?, ?, ?)
            `, [villeDepart, villeArrivee, distanceKm, tempsMoyen]);
            
            res.json({
                success: true,
                message: "Route ajoutée",
                routeId: result.insertId
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async obtenirStatistiques(req, res) {
        try {
            const [nbVilles] = await db.query('SELECT COUNT(*) as count FROM villes');
            const [nbRoutes] = await db.query('SELECT COUNT(*) as count FROM routes');
            const [nbVehicules] = await db.query('SELECT COUNT(*) as count FROM vehicules');
            const [nbTrajets] = await db.query('SELECT COUNT(*) as count FROM trajets');
            
            res.json({
                success: true,
                stats: {
                    villes: nbVilles[0].count,
                    routes: nbRoutes[0].count,
                    vehicules: nbVehicules[0].count,
                    trajets: nbTrajets[0].count
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = AdminController;
