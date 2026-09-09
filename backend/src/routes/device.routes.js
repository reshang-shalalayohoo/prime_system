const express = require('express');
const router = express.Router();
const DeviceController = require('../controllers/device.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', authMiddleware, requireRole('admin'), DeviceController.getAll);
router.get('/map-data', authMiddleware, requireRole('admin'), DeviceController.getMapData);
router.get('/online-count', authMiddleware, DeviceController.getOnlineCount);
router.get('/:id/detail', authMiddleware, requireRole('admin'), DeviceController.getDetail);
router.post('/', authMiddleware, requireRole('admin'), DeviceController.create);
router.patch('/:id', authMiddleware, requireRole('admin'), DeviceController.update);
router.patch('/:id/location', authMiddleware, requireRole('admin'), DeviceController.updateLocation);

module.exports = router;
