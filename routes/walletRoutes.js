const express = require('express');
const router = express.Router();
const { getSellerWallet, getBuyerWallet } = require('../controllers/walletsController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Seller wallet
router.get('/seller', authenticateJWT, getSellerWallet);

// Buyer wallet (optional)
router.get('/buyer', authenticateJWT, getBuyerWallet);

module.exports = router;