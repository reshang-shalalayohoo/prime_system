const { query } = require('../config/db');

const RecommendationModel = {
  async create({ sensorReadingId, fieldId, nStatus, pStatus, kStatus, fertilizerType, applicationRate, recommendationText }) {
    const [result] = await query(
      'INSERT INTO recommendations (sensor_reading_id, field_id, n_status, p_status, k_status, fertilizer_type, application_rate, recommendation_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [sensorReadingId, fieldId, nStatus, pStatus, kStatus, fertilizerType, applicationRate, recommendationText]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await query('SELECT * FROM recommendations WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByFieldId(fieldId, limit = 50) {
    const [rows] = await query(`
      SELECT r.*, sr.soil_moisture, sr.water_level, sr.nitrogen, sr.phosphorus, sr.potassium, sr.timestamp as reading_timestamp
      FROM recommendations r
      JOIN sensor_readings sr ON r.sensor_reading_id = sr.id
      WHERE r.field_id = ?
      ORDER BY r.created_at DESC LIMIT ?
    `, [fieldId, limit]);
    return rows;
  },

  async getLatestByFieldId(fieldId) {
    const [rows] = await query(`
      SELECT r.*, sr.soil_moisture, sr.water_level, sr.nitrogen, sr.phosphorus, sr.potassium, sr.timestamp as reading_timestamp
      FROM recommendations r
      JOIN sensor_readings sr ON r.sensor_reading_id = sr.id
      WHERE r.field_id = ?
      ORDER BY r.created_at DESC LIMIT 1
    `, [fieldId]);
    return rows[0] || null;
  },

  async getStats(fieldId) {
    const [rows] = await query(`
      SELECT 
        COUNT(*) as total_recommendations,
        SUM(CASE WHEN n_status = 'Deficient' THEN 1 ELSE 0 END) as n_deficient,
        SUM(CASE WHEN n_status = 'Sufficient' THEN 1 ELSE 0 END) as n_sufficient,
        SUM(CASE WHEN n_status = 'Excess' THEN 1 ELSE 0 END) as n_excess,
        SUM(CASE WHEN p_status = 'Deficient' THEN 1 ELSE 0 END) as p_deficient,
        SUM(CASE WHEN p_status = 'Sufficient' THEN 1 ELSE 0 END) as p_sufficient,
        SUM(CASE WHEN p_status = 'Excess' THEN 1 ELSE 0 END) as p_excess,
        SUM(CASE WHEN k_status = 'Deficient' THEN 1 ELSE 0 END) as k_deficient,
        SUM(CASE WHEN k_status = 'Sufficient' THEN 1 ELSE 0 END) as k_sufficient,
        SUM(CASE WHEN k_status = 'Excess' THEN 1 ELSE 0 END) as k_excess
      FROM recommendations WHERE field_id = ?
    `, [fieldId]);
    return rows[0];
  },

  async getAllStats() {
    const [rows] = await query(`
      SELECT 
        COUNT(*) as total_recommendations,
        SUM(CASE WHEN n_status = 'Deficient' THEN 1 ELSE 0 END) as n_deficient,
        SUM(CASE WHEN n_status = 'Sufficient' THEN 1 ELSE 0 END) as n_sufficient,
        SUM(CASE WHEN n_status = 'Excess' THEN 1 ELSE 0 END) as n_excess,
        SUM(CASE WHEN p_status = 'Deficient' THEN 1 ELSE 0 END) as p_deficient,
        SUM(CASE WHEN p_status = 'Sufficient' THEN 1 ELSE 0 END) as p_sufficient,
        SUM(CASE WHEN p_status = 'Excess' THEN 1 ELSE 0 END) as p_excess,
        SUM(CASE WHEN k_status = 'Deficient' THEN 1 ELSE 0 END) as k_deficient,
        SUM(CASE WHEN k_status = 'Sufficient' THEN 1 ELSE 0 END) as k_sufficient,
        SUM(CASE WHEN k_status = 'Excess' THEN 1 ELSE 0 END) as k_excess
      FROM recommendations
    `);
    return rows[0];
  },

  async getTodayCount() {
    const [rows] = await query("SELECT COUNT(*) as count FROM recommendations WHERE DATE(created_at) = CURDATE()");
    return rows[0].count;
  },

  async getTotalCount() {
    const [rows] = await query('SELECT COUNT(*) as count FROM recommendations');
    return rows[0].count;
  }
};

module.exports = RecommendationModel;
