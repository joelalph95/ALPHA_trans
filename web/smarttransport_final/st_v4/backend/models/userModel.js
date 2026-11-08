const { pool } = require("../config/db");
const bcrypt   = require("bcryptjs");

const UserModel = {

  // Créer un nouvel utilisateur
  async create({ username, email, password, role = "passenger" }) {
    const hash = await bcrypt.hash(password, 10);
    const [res] = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [username.trim(), email.trim().toLowerCase(), hash, role]
    );
    return res.insertId;
  },

  // Trouver par email
  async findByEmail(email) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );
    return rows[0] || null;
  },

  // Trouver par username
  async findByUsername(username) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username.trim()]
    );
    return rows[0] || null;
  },

  // Trouver par ID
  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  // Vérifier mot de passe
  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  // Mettre à jour le profil
  async updateProfile(id, { username, email }) {
    const fields = [];
    const values = [];
    if (username) { fields.push("username = ?"); values.push(username.trim()); }
    if (email)    { fields.push("email = ?");    values.push(email.trim().toLowerCase()); }
    if (!fields.length) return null;
    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
    return UserModel.findById(id);
  },

  // Changer le mot de passe
  async updatePassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hash, id]);
    return true;
  },

  // Lister tous les utilisateurs (admin)
  async getAll() {
    const [rows] = await pool.query(
      "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  },
};

module.exports = { UserModel };
