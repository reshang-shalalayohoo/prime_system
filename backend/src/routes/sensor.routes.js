const express = require('express');
const router = express.Router();
const SensorController = require('../controllers/sensor.controller');
const authMiddleware = require('../middleware/auth.middleware');
const deviceKeyMiddleware = require('../middleware/deviceKey.middleware');

// ESP32 ingestion — secured with device API key (no JWT)
router.post('/readings', deviceKeyMiddleware, SensorController.ingestReading);

// Authenticated endpoints
router.get('/readings', authMiddleware, SensorController.getReadings);
router.get('/readings/latest', authMiddleware, SensorController.getLatest);
router.get('/readings/stats', authMiddleware, SensorController.getStats);

module.exports = router;
