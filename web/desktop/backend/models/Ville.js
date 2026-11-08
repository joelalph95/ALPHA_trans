const db = require('../config/database');

class Ville {
    static async create(nom, coord_x, coord_y, population = 0) {
        const [result] = await db.query(
            'INSERT INTO villes (nom, coord_x, coord_y, population) VALUES (?, ?, ?, ?)',
            [nom, coord_x, coord_y, population]
        );
        return result.insertId;
    }

    static async getAll() {
        const [villes] = await db.query('SELECT * FROM villes');
        return villes;
    }

    static async getById(id) {
        const [ville] = await db.query('SELECT * FROM villes WHERE id = ?', [id]);
        return ville[0];
    }

    static async update(id, nom, coord_x, coord_y, population) {
        await db.query(
            'UPDATE villes SET nom = ?, coord_x = ?, coord_y = ?, population = ? WHERE id = ?',
            [nom, coord_x, coord_y, population, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM villes WHERE id = ?', [id]);
    }
}

module.exports = Ville;
