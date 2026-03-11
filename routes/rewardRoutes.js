const express = require('express');
const router = express.Router();
const { getRewards } = require('../controllers/rewardsController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// List all rewards
router.get('/', authenticateJWT, getRewards);

module.exports = router;