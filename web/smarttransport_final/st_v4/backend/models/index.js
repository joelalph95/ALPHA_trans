const { pool } = require("../config/db");

const CityModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM cities ORDER BY name");
    return rows;
  },
  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM cities WHERE id = ?", [id]);
    return rows[0] || null;
  },
};

const RouteModel = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT r.*,
             c1.name AS from_name,
             c2.name AS to_name
      FROM routes r
      JOIN cities c1 ON r.from_city = c1.id
      JOIN cities c2 ON r.to_city   = c2.id
      ORDER BY r.from_city, r.to_city
    `);
    return rows.map(RouteModel._normalize);
  },

  async updateStatus(fromCity, toCity, status, trafficFactor) {
    const fields = [];
    const values = [];
    if (status)        { fields.push("status = ?");         values.push(status); }
    if (trafficFactor) { fields.push("traffic_factor = ?"); values.push(trafficFactor); }
    if (!fields.length) return null;
    values.push(fromCity, toCity, toCity, fromCity);
    await pool.query(
      `UPDATE routes SET ${fields.join(", ")} WHERE (from_city=? AND to_city=?) OR (from_city=? AND to_city=?)`,
      values
    );
    const [rows] = await pool.query(
      "SELECT * FROM routes WHERE from_city=? AND to_city=?",
      [fromCity, toCity]
    );
    return rows[0] || null;
  },

  async getStats() {
    const [[s]] = await pool.query(`
      SELECT COUNT(*) AS total,
             SUM(status='open') AS open_count,
             SUM(status='closed') AS closed_count,
             ROUND(AVG(distance_km)) AS avg_distance
      FROM routes
    `);
    return s;
  },

  _normalize(row) {
    return {
      from:          row.from_city,
      to:            row.to_city,
      distance:      row.distance_km,
      time:          parseFloat(row.duration_h),
      fuel:          row.fuel_liters,
      trafficFactor: parseFloat(row.traffic_factor),
      status:        row.status,
    };
  },
};

const HistoryModel = {
  async save({ fromCity, toCity, trafficLevel, result }) {
    await pool.query(
      `INSERT INTO search_history
         (from_city, to_city, traffic_level, total_distance, total_time, total_fuel, path_json, exec_time_ms)
       VALUES (?,?,?,?,?,?,?,?)`,
      [fromCity, toCity, trafficLevel,
       result.totalDistance, result.totalTime, result.totalFuel,
       JSON.stringify(result.path), result.executionTime]
    );
  },
  async getRecent(limit = 10) {
    const [rows] = await pool.query(
      `SELECT h.*, c1.name AS from_name, c2.name AS to_name
       FROM search_history h
       JOIN cities c1 ON h.from_city = c1.id
       JOIN cities c2 ON h.to_city   = c2.id
       ORDER BY h.created_at DESC LIMIT ?`,
      [limit]
    );
    return rows;
  },
};

const KnapsackModel = {
  async save({ capacity, passengers, result }) {
    await pool.query(
      `INSERT INTO knapsack_sessions
         (capacity, passengers_json, selected_json, total_value, naive_value, gain_percent, exec_time_ms)
       VALUES (?,?,?,?,?,?,?)`,
      [capacity, JSON.stringify(passengers), JSON.stringify(result.selected),
       result.totalValue, result.naiveValue, result.gainPercent, result.executionTime]
    );
  },
};

module.exports = { CityModel, RouteModel, HistoryModel, KnapsackModel };
