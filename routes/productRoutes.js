const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const upload = require('../middleware/s3Upload');

router.get('/', productsController.getProducts);

// Protected: only sellers/admins can create products
router.post('/', authenticateJWT, upload.single('image'), productsController.createProduct);

module.exports = router;