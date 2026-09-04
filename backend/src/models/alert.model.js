const { query } = require('../config/db');

const AlertModel = {
  async create({ fieldId, userId, type, message, severity }) {
    const [result] = await query(
      'INSERT INTO alerts (field_id, user_id, type, message, severity) VALUES (?, ?, ?, ?, ?)',
      [fieldId || null, userId || null, type, message, severity || 'warning']
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await query('SELECT * FROM alerts WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByUserId(userId, limit = 50) {
    const [rows] = await query(`
      SELECT a.*, f.name as field_name
      FROM alerts a
      LEFT JOIN fields f ON a.field_id = f.id
      WHERE a.user_id = ? OR a.user_id IS NULL
      ORDER BY a.created_at DESC LIMIT ?
    `, [userId, limit]);
    return rows;
  },

  async getAll(limit = 100) {
    const [rows] = await query(`
      SELECT a.*, f.name as field_name, u.full_name as user_name
      FROM alerts a
      LEFT JOIN fields f ON a.field_id = f.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC LIMIT ?
    `, [limit]);
    return rows;
  },

  async markAsRead(id) {
    await query('UPDATE alerts SET is_read = 1 WHERE id = ?', [id]);
    return this.findById(id);
  },

  async markAllAsRead(userId) {
    await query(
      'UPDATE alerts SET is_read = 1 WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0',
      [userId]
    );
  },

  async getUnreadCount(userId) {
    const [rows] = await query(
      'SELECT COUNT(*) as count FROM alerts WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0',
      [userId]
    );
    return rows[0].count;
  },

  async getUnreadCountAll() {
    const [rows] = await query('SELECT COUNT(*) as count FROM alerts WHERE is_read = 0');
    return rows[0].count;
  }
};

module.exports = AlertModel;
