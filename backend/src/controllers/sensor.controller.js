const SensorReadingModel = require('../models/sensorReading.model');
const FieldModel = require('../models/field.model');
const { processSensorReading } = require('../services/recommendation.service');

const SensorController = {
  // ESP32 sensor ingestion endpoint
  async ingestReading(req, res) {
    try {
      const device = req.device;
      const { soil_moisture, water_level, nitrogen, phosphorus, potassium } = req.body;

      if (soil_moisture === undefined || water_level === undefined || 
          nitrogen === undefined || phosphorus === undefined || potassium === undefined) {
        return res.status(400).json({ 
          error: 'All sensor values are required: soil_moisture, water_level, nitrogen, phosphorus, potassium' 
        });
      }

      const result = await processSensorReading(device, req.body);

      res.status(201).json({
        success: true,
        message: result.isValid 
          ? 'Sensor reading processed and recommendation generated successfully.'
          : 'Sensor reading saved but validation errors were found.',
        data: {
          readingId: result.reading.id,
          recommendation: result.recommendation,
          isValid: result.isValid,
          validationErrors: result.validationErrors || []
        }
      });
    } catch (err) {
      console.error('Sensor ingestion error:', err);
      res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error.' });
    }
  },

  // Get sensor readings for authenticated user's field
  async getReadings(req, res) {
    try {
      const { field_id, limit } = req.query;
      
      if (field_id) {
        const readings = await SensorReadingModel.findByFieldId(parseInt(field_id), parseInt(limit) || 50);
        return res.json(readings);
      }

      // For farmers, get readings for their fields
      if (req.user.role === 'farmer') {
        const fields = await FieldModel.findByUserId(req.user.id);
        const allReadings = [];
        for (const field of fields) {
          const readings = await SensorReadingModel.findByFieldId(field.id, parseInt(limit) || 50);
          allReadings.push(...readings);
        }
        allReadings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return res.json(allReadings);
      }

      // Admin — return all from specified field
      return res.json([]);
    } catch (err) {
      console.error('Get readings error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getLatest(req, res) {
    try {
      const { field_id } = req.query;
      
      if (field_id) {
        const reading = await SensorReadingModel.getLatestByFieldId(parseInt(field_id));
        return res.json(reading || null);
      }

      // For farmers, get latest from their first field
      if (req.user.role === 'farmer') {
        const fields = await FieldModel.findByUserId(req.user.id);
        if (fields.length > 0) {
          const reading = await SensorReadingModel.getLatestByFieldId(fields[0].id);
          return res.json(reading || null);
        }
      }

      return res.json(null);
    } catch (err) {
      console.error('Get latest error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getStats(req, res) {
    try {
      const { field_id } = req.query;
      
      if (field_id) {
        const stats = await SensorReadingModel.getStats(parseInt(field_id));
        return res.json(stats);
      }

      if (req.user.role === 'farmer') {
        const fields = await FieldModel.findByUserId(req.user.id);
        if (fields.length > 0) {
          const stats = await SensorReadingModel.getStats(fields[0].id);
          return res.json(stats);
        }
      }

      const stats = await SensorReadingModel.getAllStats();
      return res.json(stats);
    } catch (err) {
      console.error('Get stats error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = SensorController;
