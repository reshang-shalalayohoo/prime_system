const SensorReadingModel = require('../models/sensorReading.model');
const RecommendationModel = require('../models/recommendation.model');
const FertilizerLogModel = require('../models/fertilizerLog.model');
const FieldModel = require('../models/field.model');
const DeviceModel = require('../models/device.model');
const UserModel = require('../models/user.model');
const AlertModel = require('../models/alert.model');

const ReportController = {
  async getFarmerReport(req, res) {
    try {
      const fields = await FieldModel.findByUserId(req.user.id);
      if (fields.length === 0) {
        return res.json({
          fields: [],
          stats: null,
          recommendations: { total: 0, stats: null },
          fertilizerLogs: []
        });
      }

      const fieldId = parseInt(req.query.field_id) || fields[0].id;
      const sensorStats = await SensorReadingModel.getStats(fieldId);
      const recStats = await RecommendationModel.getStats(fieldId);
      const totalRecs = await RecommendationModel.findByFieldId(fieldId, 100);
      const fertLogs = await FertilizerLogModel.findByFieldId(fieldId, 100);

      res.json({
        fields,
        stats: sensorStats,
        recommendations: {
          total: totalRecs.length,
          stats: recStats
        },
        fertilizerLogs: fertLogs
      });
    } catch (err) {
      console.error('Get farmer report error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getAdminReport(req, res) {
    try {
      const sensorStats = await SensorReadingModel.getAllStats();
      const recStats = await RecommendationModel.getAllStats();
      const totalReadings = await SensorReadingModel.getTotalCount();
      const totalRecs = await RecommendationModel.getTotalCount();
      const totalDevices = await DeviceModel.getCount();
      const totalFields = await FieldModel.getCount();
      const totalFarmers = await UserModel.getCountByRole('farmer');
      const totalFertLogs = await FertilizerLogModel.getTotalCount();
      const unreadAlerts = await AlertModel.getUnreadCountAll();

      res.json({
        overview: {
          totalReadings,
          totalRecommendations: totalRecs,
          totalDevices,
          totalFields,
          totalFarmers,
          totalFertilizerApplications: totalFertLogs,
          unreadAlerts
        },
        sensorStats,
        recommendationStats: recStats
      });
    } catch (err) {
      console.error('Get admin report error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = ReportController;
