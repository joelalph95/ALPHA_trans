const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    static async register(req, res) {
        const { nom, email, password, role } = req.body;

        try {
            // Vérifier que l'email n'existe pas
            const [existingUser] = await db.query(
                'SELECT id FROM utilisateurs WHERE email = ?',
                [email]
            );

            if (existingUser.length > 0) {
                return res.json({
                    success: false,
                    message: 'Cet email existe déjà'
                });
            }

            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insérer l'utilisateur
            const [result] = await db.query(
                'INSERT INTO utilisateurs (nom, email, password, role) VALUES (?, ?, ?, ?)',
                [nom, email, hashedPassword, role || 'passager']
            );

            res.json({
                success: true,
                message: 'Utilisateur créé avec succès',
                userId: result.insertId
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async login(req, res) {
        const { email, password } = req.body;

        try {
            const [users] = await db.query(
                'SELECT * FROM utilisateurs WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.json({
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                });
            }

            const user = users[0];

            // Vérifier le mot de passe
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.json({
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                });
            }

            // Générer JWT
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'secret_key_smarttransport_2035',
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                message: 'Connexion réussie',
                user: {
                    id: user.id,
                    nom: user.nom,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getProfile(req, res) {
        const { userId } = req.params;

        try {
            const [user] = await db.query(
                'SELECT id, nom, email, role FROM utilisateurs WHERE id = ?',
                [userId]
            );

            if (user.length === 0) {
                return res.json({ success: false, message: 'Utilisateur non trouvé' });
            }

            res.json({
                success: true,
                user: user[0]
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateProfile(req, res) {
        const { userId } = req.params;
        const { nom, email } = req.body;

        try {
            await db.query(
                'UPDATE utilisateurs SET nom = ?, email = ? WHERE id = ?',
                [nom, email, userId]
            );

            res.json({
                success: true,
                message: 'Profil mis à jour'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getAllUsers(req, res) {
        try {
            const [users] = await db.query(
                'SELECT id, nom, email, role FROM utilisateurs'
            );

            res.json({
                success: true,
                users
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getUsersByRole(req, res) {
        const { role } = req.params;

        try {
            const [users] = await db.query(
                'SELECT id, nom, email FROM utilisateurs WHERE role = ?',
                [role]
            );

            res.json({
                success: true,
                users
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = AuthController;
