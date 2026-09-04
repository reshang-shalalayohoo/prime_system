const AlertService = require('../services/alert.service');

const AlertController = {
  async getAlerts(req, res) {
    try {
      const { limit } = req.query;
      
      if (req.user.role === 'admin') {
        const alerts = await AlertService.getAllAlerts(parseInt(limit) || 100);
        return res.json(alerts);
      }

      const alerts = await AlertService.getAlertsForUser(req.user.id, parseInt(limit) || 50);
      return res.json(alerts);
    } catch (err) {
      console.error('Get alerts error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const alert = await AlertService.markAsRead(parseInt(id));
      
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found.' });
      }

      res.json(alert);
    } catch (err) {
      console.error('Mark alert as read error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async markAllAsRead(req, res) {
    try {
      await AlertService.markAllAsRead(req.user.id);
      res.json({ message: 'All alerts marked as read.' });
    } catch (err) {
      console.error('Mark all alerts as read error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const count = req.user.role === 'admin' 
        ? await AlertService.getUnreadCountAll()
        : await AlertService.getUnreadCount(req.user.id);
      res.json({ count });
    } catch (err) {
      console.error('Get unread count error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = AlertController;
