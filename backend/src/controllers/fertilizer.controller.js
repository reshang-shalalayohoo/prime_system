const FertilizerLogModel = require('../models/fertilizerLog.model');
const FieldModel = require('../models/field.model');
const ActivityLogModel = require('../models/activityLog.model');

const FertilizerController = {
  async create(req, res) {
    try {
      const { field_id, fertilizer_type, amount_kg, notes } = req.body;

      if (!fertilizer_type || !amount_kg) {
        return res.status(400).json({ error: 'Fertilizer type and amount are required.' });
      }

      // Use provided field_id or default to user's first field
      let fieldId = field_id;
      if (!fieldId) {
        const fields = await FieldModel.findByUserId(req.user.id);
        if (fields.length === 0) {
          return res.status(400).json({ error: 'No field found. Please contact your administrator.' });
        }
        fieldId = fields[0].id;
      }

      const log = await FertilizerLogModel.create({
        fieldId,
        userId: req.user.id,
        fertilizerType: fertilizer_type,
        amountKg: parseFloat(amount_kg),
        notes
      });

      // Record activity
      const field = await FieldModel.findById(fieldId);
      await ActivityLogModel.create({
        userId: req.user.id,
        action: 'Applied Fertilizer',
        entityType: 'fertilizer_log',
        entityId: log.id,
        details: `Applied ${amount_kg} kg/ha ${fertilizer_type} to ${field ? field.name : 'field'}`
      });

      res.status(201).json(log);
    } catch (err) {
      console.error('Create fertilizer log error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getLogs(req, res) {
    try {
      const { field_id, limit } = req.query;

      if (field_id) {
        const logs = await FertilizerLogModel.findByFieldId(parseInt(field_id), parseInt(limit) || 50);
        return res.json(logs);
      }

      if (req.user.role === 'farmer') {
        const logs = await FertilizerLogModel.getByUserId(req.user.id, parseInt(limit) || 50);
        return res.json(logs);
      }

      const logs = await FertilizerLogModel.getAll(parseInt(limit) || 100);
      return res.json(logs);
    } catch (err) {
      console.error('Get fertilizer logs error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = FertilizerController;
