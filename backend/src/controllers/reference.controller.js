const ReferenceValueModel = require('../models/referenceValue.model');
const ActivityLogModel = require('../models/activityLog.model');

const ReferenceController = {
  async getAll(req, res) {
    try {
      const refs = await ReferenceValueModel.getAll();
      res.json(refs);
    } catch (err) {
      console.error('Get reference values error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async update(req, res) {
    try {
      const { values } = req.body;

      if (!values || !Array.isArray(values)) {
        return res.status(400).json({ error: 'An array of reference values is required.' });
      }

      const results = [];
      for (const val of values) {
        const { nutrient, growth_stage, min_sufficient, max_sufficient } = val;

        if (!nutrient || !growth_stage || min_sufficient === undefined || max_sufficient === undefined) {
          return res.status(400).json({ error: 'Each value must include nutrient, growth_stage, min_sufficient, and max_sufficient.' });
        }

        if (min_sufficient >= max_sufficient) {
          return res.status(400).json({ error: `min_sufficient (${min_sufficient}) must be less than max_sufficient (${max_sufficient}) for ${nutrient}/${growth_stage}.` });
        }

        const ref = await ReferenceValueModel.upsert({
          nutrient,
          growthStage: growth_stage,
          minSufficient: parseFloat(min_sufficient),
          maxSufficient: parseFloat(max_sufficient),
          updatedBy: req.user.id
        });

        results.push(ref);
      }

      // Log activity
      await ActivityLogModel.create({
        userId: req.user.id,
        action: 'Updated Reference Values',
        entityType: 'reference_value',
        entityId: null,
        details: `Updated ${values.length} SSNM/NOPT reference value(s)`
      });

      res.json({ message: 'Reference values updated successfully.', values: results });
    } catch (err) {
      console.error('Update reference values error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = ReferenceController;
