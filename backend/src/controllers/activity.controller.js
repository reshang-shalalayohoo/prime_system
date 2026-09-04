const ActivityLogModel = require('../models/activityLog.model');

const ActivityController = {
  async getAll(req, res) {
    try {
      const { limit } = req.query;
      const logs = await ActivityLogModel.getAll(parseInt(limit) || 100);
      res.json(logs);
    } catch (err) {
      console.error('Get activity logs error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getRecent(req, res) {
    try {
      const { limit } = req.query;
      const logs = await ActivityLogModel.getRecent(parseInt(limit) || 10);
      res.json(logs);
    } catch (err) {
      console.error('Get recent activity error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = ActivityController;
