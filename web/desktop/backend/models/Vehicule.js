const db = require('../config/database');

class Vehicule {
    static async create(immatriculation, capacite_max, chauffeur_nom, cooperative_id, carburant_litres = 50, consommation_km = 0.25) {
        const [result] = await db.query(
            'INSERT INTO vehicules (immatriculation, capacite_max, chauffeur_nom, cooperative_id, carburant_litres, consommation_km) VALUES (?, ?, ?, ?, ?, ?)',
            [immatriculation, capacite_max, chauffeur_nom, cooperative_id, carburant_litres, consommation_km]
        );
        return result.insertId;
    }

    static async getAll() {
        const [vehicules] = await db.query('SELECT * FROM vehicules');
        return vehicules;
    }

    static async getById(id) {
        const [vehicule] = await db.query('SELECT * FROM vehicules WHERE id = ?', [id]);
        return vehicule[0];
    }

    static async update(id, places_occupees, carburant_litres) {
        await db.query(
            'UPDATE vehicules SET places_occupees = ?, carburant_litres = ? WHERE id = ?',
            [places_occupees, carburant_litres, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM vehicules WHERE id = ?', [id]);
    }

    static async getByImmatriculation(immatriculation) {
        const [vehicule] = await db.query('SELECT * FROM vehicules WHERE immatriculation = ?', [immatriculation]);
        return vehicule[0];
    }

    static async getByCooperative(cooperative_id) {
        const [vehicules] = await db.query('SELECT * FROM vehicules WHERE cooperative_id = ?', [cooperative_id]);
        return vehicules;
    }

    static async updateCarburant(id, distance_km, consommation_km) {
        const carburantConsomme = (distance_km * consommation_km) / 100;
        await db.query(
            'UPDATE vehicules SET carburant_litres = carburant_litres - ? WHERE id = ?',
            [carburantConsomme, id]
        );
    }
}

module.exports = Vehicule;
