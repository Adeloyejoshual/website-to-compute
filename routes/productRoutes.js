const express = require('express');
const router = express.Router();
const { getProducts, createProduct } = require('../controllers/productsController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const upload = require('../middleware/s3Upload');

// Public: list all products
router.get('/', getProducts);

// Protected: create product (seller/admin)
router.post('/', authenticateJWT, upload.single('image'), createProduct);

module.exports = router;