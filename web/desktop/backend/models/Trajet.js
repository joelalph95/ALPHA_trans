const db = require('../config/database');

class Trajet {
    static async create(vehicule_id, date_depart, heure_depart, places_disponibles, statut = 'Planifie') {
        const [result] = await db.query(
            'INSERT INTO trajets (vehicule_id, date_depart, heure_depart, places_disponibles, statut) VALUES (?, ?, ?, ?, ?)',
            [vehicule_id, date_depart, heure_depart, places_disponibles, statut]
        );
        return result.insertId;
    }

    static async getAll() {
        const [trajets] = await db.query('SELECT * FROM trajets');
        return trajets;
    }

    static async getById(id) {
        const [trajet] = await db.query('SELECT * FROM trajets WHERE id = ?', [id]);
        return trajet[0];
    }

    static async update(id, places_disponibles, statut, itineraire) {
        await db.query(
            'UPDATE trajets SET places_disponibles = ?, statut = ?, itineraire = ? WHERE id = ?',
            [places_disponibles, statut, JSON.stringify(itineraire), id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM trajets WHERE id = ?', [id]);
    }

    static async getByVehicule(vehicule_id) {
        const [trajets] = await db.query('SELECT * FROM trajets WHERE vehicule_id = ?', [vehicule_id]);
        return trajets;
    }

    static async getByDate(date) {
        const [trajets] = await db.query('SELECT * FROM trajets WHERE DATE(date_depart) = ?', [date]);
        return trajets;
    }
}

module.exports = Trajet;
