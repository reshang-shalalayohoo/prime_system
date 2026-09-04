const RecommendationModel = require('../models/recommendation.model');
const FieldModel = require('../models/field.model');

const RecommendationController = {
  async getRecommendations(req, res) {
    try {
      const { field_id, limit } = req.query;
      
      if (field_id) {
        const recs = await RecommendationModel.findByFieldId(parseInt(field_id), parseInt(limit) || 50);
        return res.json(recs);
      }

      if (req.user.role === 'farmer') {
        const fields = await FieldModel.findByUserId(req.user.id);
        const allRecs = [];
        for (const field of fields) {
          const recs = await RecommendationModel.findByFieldId(field.id, parseInt(limit) || 50);
          allRecs.push(...recs);
        }
        allRecs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return res.json(allRecs);
      }

      return res.json([]);
    } catch (err) {
      console.error('Get recommendations error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getLatest(req, res) {
    try {
      const { field_id } = req.query;
      
      if (field_id) {
        const rec = await RecommendationModel.getLatestByFieldId(parseInt(field_id));
        return res.json(rec || null);
      }

      if (req.user.role === 'farmer') {
        const fields = await FieldModel.findByUserId(req.user.id);
        if (fields.length > 0) {
          const rec = await RecommendationModel.getLatestByFieldId(fields[0].id);
          return res.json(rec || null);
        }
      }

      return res.json(null);
    } catch (err) {
      console.error('Get latest recommendation error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getStats(req, res) {
    try {
      const { field_id } = req.query;
      
      if (field_id) {
        const stats = await RecommendationModel.getStats(parseInt(field_id));
        return res.json(stats);
      }

      if (req.user.role === 'farmer') {
        const fields = await FieldModel.findByUserId(req.user.id);
        if (fields.length > 0) {
          return res.json(await RecommendationModel.getStats(fields[0].id));
        }
      }

      return res.json(await RecommendationModel.getAllStats());
    } catch (err) {
      console.error('Get recommendation stats error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = RecommendationController;
