const express = require('express');
const router = express.Router();
const { placeOrder } = require('../controllers/ordersController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Place order
router.post('/', authenticateJWT, placeOrder);

module.exports = router;