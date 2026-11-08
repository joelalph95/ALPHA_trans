const db = require('../config/database');

class Route {
    static async create(ville_depart, ville_arrivee, distance_km, temps_moyen) {
        const [result] = await db.query(
            'INSERT INTO routes (ville_depart, ville_arrivee, distance_km, temps_moyen) VALUES (?, ?, ?, ?)',
            [ville_depart, ville_arrivee, distance_km, temps_moyen]
        );
        return result.insertId;
    }

    static async getAll() {
        const [routes] = await db.query('SELECT * FROM routes');
        return routes;
    }

    static async getById(id) {
        const [route] = await db.query('SELECT * FROM routes WHERE id = ?', [id]);
        return route[0];
    }

    static async update(id, distance_km, temps_moyen, etat, trafic) {
        await db.query(
            'UPDATE routes SET distance_km = ?, temps_moyen = ?, etat = ?, trafic = ? WHERE id = ?',
            [distance_km, temps_moyen, etat, trafic, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM routes WHERE id = ?', [id]);
    }

    static async getByVilles(ville_depart, ville_arrivee) {
        const [route] = await db.query(
            'SELECT * FROM routes WHERE ville_depart = ? AND ville_arrivee = ?',
            [ville_depart, ville_arrivee]
        );
        return route[0];
    }
}

module.exports = Route;
