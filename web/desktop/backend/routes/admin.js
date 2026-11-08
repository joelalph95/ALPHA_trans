const express = require('express');
const router = express.Router();
const db = require('../config/database');
const AdminController = require('../controllers/adminController');

// Mettre à jour le trafic
router.put('/trafic/:routeId', async (req, res) => {
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
});

// Gérer les routes
router.post('/routes', async (req, res) => {
    const { villeDepart, villeArrivee, distanceKm, tempsMoyen } = req.body;
    
    try {
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
});

// Obtenir les statistiques
router.get('/statistiques', AdminController.obtenirStatistiques);

module.exports = router;
