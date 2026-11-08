const mysql = require("mysql2/promise");

const dbConfig = {
  host:               process.env.DB_HOST     || "localhost",
  port:               parseInt(process.env.DB_PORT || "3306"),
  user:               process.env.DB_USER     || "root",
  password:           process.env.DB_PASSWORD || "",   // Vide par défaut sur WampServer
  database:           process.env.DB_NAME     || "smarttransport",
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           "+00:00",
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log(`✅ MySQL WampServer connecté → ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    conn.release();
    return true;
  } catch (err) {
    console.error("❌ MySQL non disponible :", err.message);
    console.warn("⚠️  Mode JSON (fallback) activé — le projet reste fonctionnel");
    return false;
  }
}

module.exports = { pool, testConnection };
