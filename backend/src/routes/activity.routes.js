const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activity.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', authMiddleware, requireRole('admin'), ActivityController.getAll);
router.get('/recent', authMiddleware, requireRole('admin'), ActivityController.getRecent);

module.exports = router;
