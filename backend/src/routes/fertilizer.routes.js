const express = require('express');
const router = express.Router();
const FertilizerController = require('../controllers/fertilizer.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, FertilizerController.create);
router.get('/', authMiddleware, FertilizerController.getLogs);

module.exports = router;
