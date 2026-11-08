const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Authentification
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Profil
router.get('/profile/:userId', AuthController.getProfile);
router.put('/profile/:userId', AuthController.updateProfile);

// Utilisateurs
router.get('/users', AuthController.getAllUsers);
router.get('/users/role/:role', AuthController.getUsersByRole);

module.exports = router;
