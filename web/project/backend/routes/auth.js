const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
require('dotenv').config();

// Inscription
router.post('/register', async (req, res) => {
  const { nom, email, mot_de_passe, role, telephone, cooperative_id } = req.body;

  if (!nom || !email || !mot_de_passe || !role) {
    return res.status(400).json({ error: 'Champs obligatoires : nom, email, mot_de_passe, role.' });
  }

  const rolesValides = ['passager', 'chauffeur', 'cooperative', 'admin'];
  if (!rolesValides.includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide.' });
  }

  try {
    const hashed = await bcrypt.hash(mot_de_passe, 10);
    const [result] = await pool.query(
      'INSERT INTO Utilisateurs (nom, email, mot_de_passe, role, telephone, cooperative_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, email, hashed, role, telephone || null, cooperative_id || null]
    );
    res.status(201).json({ id: result.insertId, nom, email, role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;
  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM Utilisateurs WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Identifiants incorrects.' });

    const user = rows[0];
    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects.' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Profil utilisateur
router.get('/profile', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nom, email, role, telephone FROM Utilisateurs WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;