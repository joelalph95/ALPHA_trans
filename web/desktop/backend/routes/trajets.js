const express = require('express');
const router = express.Router();
const db = require('../config/database');
const TrajetController = require('../controllers/trajetController');

// Rechercher un trajet - deleguer au controller
router.post('/rechercher', (req, res) => {
    TrajetController.rechercher(req, res);
});

// Consulter un itinéraire
router.get('/itineraire/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [trajet] = await db.query(`
            SELECT t.*, v.immatriculation, v.chauffeur_nom
            FROM trajets t
            JOIN vehicules v ON t.vehicule_id = v.id
            WHERE t.id = ?
        `, [id]);
        
        if (trajet.length > 0) {
            res.json({
                success: true,
                trajet: trajet[0],
                itineraire: JSON.parse(trajet[0].itineraire || '[]')
            });
        } else {
            res.json({ success: false, message: "Trajet non trouvé" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
