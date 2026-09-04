const express = require('express');
const router = express.Router();
const AlertController = require('../controllers/alert.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, AlertController.getAlerts);
router.patch('/:id/read', authMiddleware, AlertController.markAsRead);
router.patch('/mark-all-read', authMiddleware, AlertController.markAllAsRead);
router.get('/unread-count', authMiddleware, AlertController.getUnreadCount);

module.exports = router;
