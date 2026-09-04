const { query } = require('../config/db');

const ActivityLogModel = {
  async create({ userId, action, entityType, entityId, details }) {
    const [result] = await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId || null, action, entityType || null, entityId || null, details || null]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await query('SELECT * FROM activity_logs WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async getAll(limit = 100) {
    const [rows] = await query(`
      SELECT al.*, u.full_name as user_name, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC LIMIT ?
    `, [limit]);
    return rows;
  },

  async getRecent(limit = 10) {
    const [rows] = await query(`
      SELECT al.*, u.full_name as user_name, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC LIMIT ?
    `, [limit]);
    return rows;
  },

  async getByUserId(userId, limit = 50) {
    const [rows] = await query(
      'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  }
};

module.exports = ActivityLogModel;
