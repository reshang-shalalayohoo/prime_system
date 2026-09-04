const express = require('express');
const router = express.Router();
const ReferenceController = require('../controllers/reference.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', authMiddleware, ReferenceController.getAll);
router.put('/', authMiddleware, requireRole('admin'), ReferenceController.update);

module.exports = router;
