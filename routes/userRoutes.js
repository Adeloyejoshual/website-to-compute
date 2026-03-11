const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminsController');
const { updateOrderStatus } = require('../controllers/ordersController');

// Admin login
router.post('/login', loginAdmin);

// Admin updates order status
router.put('/orders/:orderId/status', updateOrderStatus);

module.exports = router;