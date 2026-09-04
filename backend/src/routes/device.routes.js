const express = require('express');
const router = express.Router();
const DeviceController = require('../controllers/device.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', authMiddleware, requireRole('admin'), DeviceController.getAll);
router.post('/', authMiddleware, requireRole('admin'), DeviceController.create);
router.patch('/:id', authMiddleware, requireRole('admin'), DeviceController.update);
router.get('/online-count', authMiddleware, DeviceController.getOnlineCount);

module.exports = router;
