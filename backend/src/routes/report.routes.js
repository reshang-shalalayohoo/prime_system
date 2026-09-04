const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/farmer', authMiddleware, ReportController.getFarmerReport);
router.get('/admin', authMiddleware, requireRole('admin'), ReportController.getAdminReport);

module.exports = router;
