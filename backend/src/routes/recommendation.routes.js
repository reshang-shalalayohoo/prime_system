const express = require('express');
const router = express.Router();
const RecommendationController = require('../controllers/recommendation.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, RecommendationController.getRecommendations);
router.get('/latest', authMiddleware, RecommendationController.getLatest);
router.get('/stats', authMiddleware, RecommendationController.getStats);

module.exports = router;
