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

  async create({ deviceCode, apiKey, deviceName, fieldId, latitude, longitude }) {
    const [result] = await query(
      'INSERT INTO devices (device_code, api_key, device_name, field_id, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
      [deviceCode, apiKey, deviceName, fieldId || null, latitude || null, longitude || null]
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

  async updateLocation(id, { latitude, longitude }) {
    await query(
      'UPDATE devices SET latitude = ?, longitude = ?, updated_at = NOW() WHERE id = ?',
      [latitude, longitude, id]
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
      SELECT d.*, f.name as field_name, f.location as field_location, f.growth_stage as field_growth_stage
      FROM devices d
      LEFT JOIN fields f ON d.field_id = f.id
      ORDER BY d.created_at DESC
    `);
    return rows;
  },

  /**
   * Get a single device with its field info and latest sensor reading + recommendation.
   */
  async getDetailWithReadings(id) {
    // Device + field info
    const [deviceRows] = await query(`
      SELECT d.*, f.name as field_name, f.location as field_location, 
             f.growth_stage as field_growth_stage, f.crop_type as field_crop_type,
             f.area_hectares as field_area
      FROM devices d
      LEFT JOIN fields f ON d.field_id = f.id
      WHERE d.id = ?
    `, [id]);
    
    if (!deviceRows[0]) return null;
    const device = deviceRows[0];

    // Latest sensor reading
    const [readingRows] = await query(`
      SELECT * FROM sensor_readings 
      WHERE device_id = ? AND is_valid = 1 
      ORDER BY timestamp DESC LIMIT 1
    `, [id]);
    device.latest_reading = readingRows[0] || null;

    // Latest recommendation (if reading exists)
    if (device.latest_reading) {
      const [recRows] = await query(`
        SELECT * FROM recommendations 
        WHERE sensor_reading_id = ? 
        LIMIT 1
      `, [device.latest_reading.id]);
      device.latest_recommendation = recRows[0] || null;
    } else {
      device.latest_recommendation = null;
    }

    // Recent readings (last 10 for mini chart)
    const [recentRows] = await query(`
      SELECT nitrogen, phosphorus, potassium, soil_moisture, water_level, timestamp
      FROM sensor_readings 
      WHERE device_id = ? AND is_valid = 1 
      ORDER BY timestamp DESC LIMIT 10
    `, [id]);
    device.recent_readings = recentRows.reverse();

    return device;
  },

  /**
   * Get all devices with their latest readings — for map view and dashboard.
   */
  async getAllWithLatestReadings() {
    const [devices] = await query(`
      SELECT d.*, f.name as field_name, f.location as field_location,
             f.growth_stage as field_growth_stage
      FROM devices d
      LEFT JOIN fields f ON d.field_id = f.id
      ORDER BY d.created_at DESC
    `);

    // Fetch latest reading for each device
    for (const device of devices) {
      const [readingRows] = await query(`
        SELECT nitrogen, phosphorus, potassium, soil_moisture, water_level, timestamp
        FROM sensor_readings 
        WHERE device_id = ? AND is_valid = 1 
        ORDER BY timestamp DESC LIMIT 1
      `, [device.id]);
      device.latest_reading = readingRows[0] || null;
    }

    return devices;
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
