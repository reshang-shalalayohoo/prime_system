const { query } = require('../config/db');

const FieldModel = {
  async findById(id) {
    const [rows] = await query('SELECT * FROM fields WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const [rows] = await query(
      'SELECT * FROM fields WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  async create({ name, location, areaHectares, cropType, growthStage, userId }) {
    const [result] = await query(
      'INSERT INTO fields (name, location, area_hectares, crop_type, growth_stage, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, location || null, areaHectares || null, cropType || 'Palay', growthStage || 'Vegetative', userId]
    );
    return this.findById(result.insertId);
  },

  async update(id, { name, location, areaHectares, cropType, growthStage }) {
    await query(
      `UPDATE fields SET name = COALESCE(?, name), location = COALESCE(?, location),
       area_hectares = COALESCE(?, area_hectares), crop_type = COALESCE(?, crop_type),
       growth_stage = COALESCE(?, growth_stage), updated_at = NOW()
       WHERE id = ?`,
      [name || null, location || null, areaHectares || null, cropType || null, growthStage || null, id]
    );
    return this.findById(id);
  },

  async getAll() {
    const [rows] = await query(`
      SELECT f.*, u.full_name as farmer_name, u.username as farmer_username
      FROM fields f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.is_active = 1
      ORDER BY f.created_at DESC
    `);
    return rows;
  },

  async getCount() {
    const [rows] = await query('SELECT COUNT(*) as count FROM fields WHERE is_active = 1');
    return rows[0].count;
  }
};

module.exports = FieldModel;
