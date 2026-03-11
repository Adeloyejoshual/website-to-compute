const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const upload = require('../middleware/s3Upload');

// Get all products
router.get('/', productsController.getProducts);

// Create product (protected, seller/admin)
router.post('/', authenticateJWT, upload.single('image'), productsController.createProduct);

module.exports = router;