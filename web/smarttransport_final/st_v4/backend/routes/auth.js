const express   = require("express");
const router    = express.Router();
const { UserModel }                     = require("../models/userModel");
const { generateToken, requireAuth }    = require("../middleware/auth");

// ─── Validation helpers ──────────────────────────────────────
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(pw) {
  return pw && pw.length >= 6;
}

// ═══════════════════════════════════════════════════
//  POST /api/auth/register — Créer un compte
// ═══════════════════════════════════════════════════
router.post("/register", async (req, res) => {
  const { username, email, password, role = "passenger" } = req.body;

  // Validations
  if (!username || username.trim().length < 3)
    return res.status(400).json({ success: false, error: "Le nom d'utilisateur doit avoir au moins 3 caractères." });
  if (!email || !validateEmail(email))
    return res.status(400).json({ success: false, error: "Adresse email invalide." });
  if (!validatePassword(password))
    return res.status(400).json({ success: false, error: "Le mot de passe doit avoir au moins 6 caractères." });
if (!["passenger", "driver", "cooperative"].includes(role))
    return res.status(400).json({ success: false, error: "Rôle invalide. Choisir : passenger, driver ou cooperative." });

  try {
    // Vérifier si username ou email existe déjà
    const existingEmail    = await UserModel.findByEmail(email);
    if (existingEmail)
      return res.status(409).json({ success: false, error: "Cette adresse email est déjà utilisée." });

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername)
      return res.status(409).json({ success: false, error: "Ce nom d'utilisateur est déjà pris." });

    // Créer l'utilisateur
    const userId = await UserModel.create({ username, email, password, role });
    const user   = await UserModel.findById(userId);
    const token  = generateToken(user);

    res.status(201).json({
      success: true,
      message: `Compte créé avec succès ! Bienvenue, ${user.username} 🎉`,
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: "Erreur lors de la création du compte." });
  }
});

// ═══════════════════════════════════════════════════
//  POST /api/auth/login — Connexion
// ═══════════════════════════════════════════════════
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, error: "Email et mot de passe requis." });

  try {
    const user = await UserModel.findByEmail(email);
    if (!user)
      return res.status(401).json({ success: false, error: "Email ou mot de passe incorrect." });

    const valid = await UserModel.verifyPassword(password, user.password);
    if (!valid)
      return res.status(401).json({ success: false, error: "Email ou mot de passe incorrect." });

    const token = generateToken(user);

    res.json({
      success: true,
      message: `Bon retour, ${user.username} !`,
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Erreur lors de la connexion." });
  }
});

// ═══════════════════════════════════════════════════
//  GET /api/auth/me — Profil de l'utilisateur connecté
// ═══════════════════════════════════════════════════
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "Utilisateur introuvable." });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════
//  PUT /api/auth/profile — Mettre à jour le profil
// ═══════════════════════════════════════════════════
router.put("/profile", requireAuth, async (req, res) => {
  const { username, email } = req.body;
  try {
    // Vérifier unicité si changement
    if (email) {
      const existing = await UserModel.findByEmail(email);
      if (existing && existing.id !== req.user.id)
        return res.status(409).json({ success: false, error: "Cet email est déjà utilisé." });
    }
    if (username) {
      const existing = await UserModel.findByUsername(username);
      if (existing && existing.id !== req.user.id)
        return res.status(409).json({ success: false, error: "Ce nom d'utilisateur est déjà pris." });
    }
    const updated = await UserModel.updateProfile(req.user.id, { username, email });
    const token   = generateToken(updated); // Nouveau token avec les infos à jour
    res.json({ success: true, message: "Profil mis à jour.", user: updated, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════
//  PUT /api/auth/password — Changer le mot de passe
// ═══════════════════════════════════════════════════
router.put("/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ success: false, error: "Ancien et nouveau mot de passe requis." });
  if (!validatePassword(newPassword))
    return res.status(400).json({ success: false, error: "Le nouveau mot de passe doit avoir au moins 6 caractères." });

  try {
    const user  = await UserModel.findByEmail(req.user.email);
    const valid = await UserModel.verifyPassword(currentPassword, user.password);
    if (!valid)
      return res.status(401).json({ success: false, error: "Mot de passe actuel incorrect." });

    await UserModel.updatePassword(req.user.id, newPassword);
    res.json({ success: true, message: "Mot de passe modifié avec succès." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
