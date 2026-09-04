const AlertModel = require('../models/alert.model');

const AlertService = {
  async createAlert({ fieldId, userId, type, message, severity }) {
    return AlertModel.create({ fieldId, userId, type, message, severity });
  },

  async getAlertsForUser(userId, limit = 50) {
    return AlertModel.findByUserId(userId, limit);
  },

  async getAllAlerts(limit = 100) {
    return AlertModel.getAll(limit);
  },

  async markAsRead(alertId) {
    return AlertModel.markAsRead(alertId);
  },

  async markAllAsRead(userId) {
    await AlertModel.markAllAsRead(userId);
  },

  async getUnreadCount(userId) {
    return AlertModel.getUnreadCount(userId);
  },

  async getUnreadCountAll() {
    return AlertModel.getUnreadCountAll();
  }
};

module.exports = AlertService;
