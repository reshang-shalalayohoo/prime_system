const { query } = require('../config/db');

const SensorReadingModel = {
  async create({ deviceId, fieldId, soilMoisture, waterLevel, nitrogen, phosphorus, potassium, isValid, rawData }) {
    const [result] = await query(
      'INSERT INTO sensor_readings (device_id, field_id, soil_moisture, water_level, nitrogen, phosphorus, potassium, is_valid, raw_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [deviceId, fieldId, soilMoisture, waterLevel, nitrogen, phosphorus, potassium, isValid ? 1 : 0, rawData || null]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await query('SELECT * FROM sensor_readings WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByFieldId(fieldId, limit = 50) {
    const [rows] = await query(
      'SELECT * FROM sensor_readings WHERE field_id = ? ORDER BY timestamp DESC LIMIT ?',
      [fieldId, limit]
    );
    return rows;
  },

  async getLatestByFieldId(fieldId) {
    const [rows] = await query(
      'SELECT * FROM sensor_readings WHERE field_id = ? ORDER BY timestamp DESC LIMIT 1',
      [fieldId]
    );
    return rows[0] || null;
  },

  async getLatestByDeviceId(deviceId) {
    const [rows] = await query(
      'SELECT * FROM sensor_readings WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1',
      [deviceId]
    );
    return rows[0] || null;
  },

  async getByFieldIdPaginated(fieldId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [readings] = await query(
      'SELECT * FROM sensor_readings WHERE field_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [fieldId, limit, offset]
    );
    const [countResult] = await query(
      'SELECT COUNT(*) as count FROM sensor_readings WHERE field_id = ?',
      [fieldId]
    );
    const total = countResult[0].count;
    return { readings, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getStats(fieldId) {
    const [rows] = await query(`
      SELECT 
        COUNT(*) as total_readings,
        ROUND(AVG(soil_moisture), 1) as avg_moisture,
        ROUND(AVG(water_level), 1) as avg_water_level,
        ROUND(AVG(nitrogen), 1) as avg_nitrogen,
        ROUND(AVG(phosphorus), 1) as avg_phosphorus,
        ROUND(AVG(potassium), 1) as avg_potassium,
        MIN(timestamp) as first_reading,
        MAX(timestamp) as last_reading
      FROM sensor_readings WHERE field_id = ? AND is_valid = 1
    `, [fieldId]);
    return rows[0];
  },

  async getAllStats() {
    const [rows] = await query(`
      SELECT 
        COUNT(*) as total_readings,
        ROUND(AVG(soil_moisture), 1) as avg_moisture,
        ROUND(AVG(water_level), 1) as avg_water_level,
        ROUND(AVG(nitrogen), 1) as avg_nitrogen,
        ROUND(AVG(phosphorus), 1) as avg_phosphorus,
        ROUND(AVG(potassium), 1) as avg_potassium
      FROM sensor_readings WHERE is_valid = 1
    `);
    return rows[0];
  },

  async getTotalCount() {
    const [rows] = await query('SELECT COUNT(*) as count FROM sensor_readings');
    return rows[0].count;
  }
};

module.exports = SensorReadingModel;
