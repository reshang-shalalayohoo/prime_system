const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', authMiddleware, requireRole('admin'), UserController.getAll);
router.post('/', authMiddleware, requireRole('admin'), UserController.create);
router.patch('/:id/status', authMiddleware, requireRole('admin'), UserController.updateStatus);

module.exports = router;
