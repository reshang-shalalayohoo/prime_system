const { query } = require('../config/db');

const ReferenceValueModel = {
  async getAll() {
    const [rows] = await query(`
      SELECT rv.*, u.full_name as updated_by_name
      FROM reference_values rv
      LEFT JOIN users u ON rv.updated_by = u.id
      ORDER BY rv.nutrient, rv.growth_stage
    `);
    return rows;
  },

  async getByNutrientAndStage(nutrient, growthStage) {
    const [rows] = await query(
      'SELECT * FROM reference_values WHERE nutrient = ? AND growth_stage = ?',
      [nutrient, growthStage]
    );
    return rows[0] || null;
  },

  async getByGrowthStage(growthStage) {
    const [rows] = await query(
      'SELECT * FROM reference_values WHERE growth_stage = ?',
      [growthStage]
    );
    return rows;
  },

  async upsert({ nutrient, growthStage, minSufficient, maxSufficient, updatedBy }) {
    // MySQL INSERT ... ON DUPLICATE KEY UPDATE using the unique key (nutrient, growth_stage)
    await query(`
      INSERT INTO reference_values (nutrient, growth_stage, min_sufficient, max_sufficient, updated_by)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        min_sufficient = VALUES(min_sufficient),
        max_sufficient = VALUES(max_sufficient),
        updated_by = VALUES(updated_by),
        updated_at = NOW()
    `, [nutrient, growthStage, minSufficient, maxSufficient, updatedBy]);

    return this.getByNutrientAndStage(nutrient, growthStage);
  }
};

module.exports = ReferenceValueModel;
