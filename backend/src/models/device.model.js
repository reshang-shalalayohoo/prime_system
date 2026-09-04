const { query } = require('../config/db');

const DeviceModel = {
  async findById(id) {
    const [rows] = await query('SELECT * FROM devices WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByApiKey(apiKey) {
    const [rows] = await query('SELECT * FROM devices WHERE api_key = ?', [apiKey]);
    return rows[0] || null;
  },

  async findByDeviceCode(deviceCode) {
    const [rows] = await query('SELECT * FROM devices WHERE device_code = ?', [deviceCode]);
    return rows[0] || null;
  },

  async create({ deviceCode, apiKey, deviceName, fieldId }) {
    const [result] = await query(
      'INSERT INTO devices (device_code, api_key, device_name, field_id) VALUES (?, ?, ?, ?)',
      [deviceCode, apiKey, deviceName, fieldId || null]
    );
    return this.findById(result.insertId);
  },

  async updateStatus(id, { status, batteryLevel }) {
    await query(
      'UPDATE devices SET status = COALESCE(?, status), battery_level = COALESCE(?, battery_level), updated_at = NOW() WHERE id = ?',
      [status || null, batteryLevel !== undefined ? batteryLevel : null, id]
    );
    return this.findById(id);
  },

  async updateLastCommunication(id) {
    await query(
      "UPDATE devices SET last_communication = NOW(), status = 'online', updated_at = NOW() WHERE id = ?",
      [id]
    );
  },

  async updateHeartbeat(id, { status, batteryLevel, lastHeartbeat }) {
    await query(
      'UPDATE devices SET status = ?, battery_level = COALESCE(?, battery_level), last_heartbeat = ?, last_communication = NOW(), updated_at = NOW() WHERE id = ?',
      [status, batteryLevel !== undefined ? batteryLevel : null, lastHeartbeat, id]
    );
    return this.findById(id);
  },

  async getAll() {
    const [rows] = await query(`
      SELECT d.*, f.name as field_name, f.location as field_location
      FROM devices d
      LEFT JOIN fields f ON d.field_id = f.id
      ORDER BY d.created_at DESC
    `);
    return rows;
  },

  async getOnlineCount() {
    const [rows] = await query("SELECT COUNT(*) as count FROM devices WHERE status = 'online'");
    return rows[0].count;
  },

  async getCount() {
    const [rows] = await query('SELECT COUNT(*) as count FROM devices');
    return rows[0].count;
  },

  async getAllDeviceCodes() {
    const [rows] = await query('SELECT id, device_code, status, last_heartbeat FROM devices');
    return rows;
  },

  async setOffline(id) {
    await query(
      "UPDATE devices SET status = 'offline', updated_at = NOW() WHERE id = ?",
      [id]
    );
    return this.findById(id);
  }
};

module.exports = DeviceModel;
