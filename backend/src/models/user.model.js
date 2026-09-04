const { query } = require('../config/db');

const UserModel = {
  async findByUsername(username) {
    const [rows] = await query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await query(
      'SELECT id, username, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ username, email, passwordHash, fullName, role }) {
    const [result] = await query(
      'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, email || null, passwordHash, fullName, role || 'farmer']
    );
    return this.findById(result.insertId);
  },

  async updateStatus(id, isActive) {
    await query(
      'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [isActive ? 1 : 0, id]
    );
    return this.findById(id);
  },

  async getAll() {
    const [rows] = await query(
      'SELECT id, username, email, full_name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  async getByRole(role) {
    const [rows] = await query(
      'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
      [role]
    );
    return rows;
  },

  async getCount() {
    const [rows] = await query('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    return rows[0].count;
  },

  async getCountByRole(role) {
    const [rows] = await query(
      'SELECT COUNT(*) as count FROM users WHERE role = ? AND is_active = 1',
      [role]
    );
    return rows[0].count;
  }
};

module.exports = UserModel;
