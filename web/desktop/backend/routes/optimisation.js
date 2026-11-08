const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { optimiserRemplissage } = require('../algorithms/knapsack');

// Optimiser le remplissage d'un véhicule
router.post('/remplissage/:vehiculeId', async (req, res) => {
    const { vehiculeId } = req.params;
    const { listeDemandes } = req.body;
    
    try {
        const [vehicule] = await db.query(
            'SELECT * FROM vehicules WHERE id = ?', 
            [vehiculeId]
        );
        
        if (vehicule.length === 0) {
            return res.json({ success: false, message: "Véhicule non trouvé" });
        }
        
        const placesRestantes = vehicule[0].capacite_max - vehicule[0].places_occupees;
        
        // Optimiser la sélection des passagers (problème du sac à dos)
        const optimisation = optimiserRemplissage(
            placesRestantes,
            listeDemandes,
            500 // coût du trajet
        );
        
        // Mettre à jour le véhicule
        await db.query(
            'UPDATE vehicules SET places_occupees = places_occupees + ? WHERE id = ?',
            [optimisation.placesOccupees, vehiculeId]
        );
        
        res.json({
            success: true,
            optimisation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Planifier des trajets
router.post('/planifier', async (req, res) => {
    const { vehiculeId, departures } = req.body;
    
    try {
        const trajetsInserts = [];
        
        for (const trajet of departures) {
            const [result] = await db.query(`
                INSERT INTO trajets (vehicule_id, date_depart, heure_depart, places_disponibles)
                VALUES (?, ?, ?, ?)
            `, [vehiculeId, trajet.date, trajet.heure, trajet.places]);
            
            trajetsInserts.push(result.insertId);
        }
        
        res.json({
            success: true,
            message: `${trajetsInserts.length} trajets planifiés`,
            trajetIds: trajetsInserts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
