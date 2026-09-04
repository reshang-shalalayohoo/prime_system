const { query } = require('../config/db');

const FertilizerLogModel = {
  async create({ fieldId, userId, fertilizerType, amountKg, notes }) {
    const [result] = await query(
      'INSERT INTO fertilizer_logs (field_id, user_id, fertilizer_type, amount_kg, notes) VALUES (?, ?, ?, ?, ?)',
      [fieldId, userId, fertilizerType, amountKg, notes || null]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await query('SELECT * FROM fertilizer_logs WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByFieldId(fieldId, limit = 50) {
    const [rows] = await query(`
      SELECT fl.*, u.full_name as applied_by
      FROM fertilizer_logs fl
      JOIN users u ON fl.user_id = u.id
      WHERE fl.field_id = ?
      ORDER BY fl.applied_at DESC LIMIT ?
    `, [fieldId, limit]);
    return rows;
  },

  async getByUserId(userId, limit = 50) {
    const [rows] = await query(`
      SELECT fl.*, f.name as field_name
      FROM fertilizer_logs fl
      JOIN fields f ON fl.field_id = f.id
      WHERE fl.user_id = ?
      ORDER BY fl.applied_at DESC LIMIT ?
    `, [userId, limit]);
    return rows;
  },

  async getAll(limit = 100) {
    const [rows] = await query(`
      SELECT fl.*, u.full_name as applied_by, f.name as field_name
      FROM fertilizer_logs fl
      JOIN users u ON fl.user_id = u.id
      JOIN fields f ON fl.field_id = f.id
      ORDER BY fl.applied_at DESC LIMIT ?
    `, [limit]);
    return rows;
  },

  async getTotalCount() {
    const [rows] = await query('SELECT COUNT(*) as count FROM fertilizer_logs');
    return rows[0].count;
  }
};

module.exports = FertilizerLogModel;
