const express = require("express");
const router = express.Router();
const { createOrder, getOrders } = require("../controllers/orderController");
const { authenticateJWT } = require("../middleware/authMiddleware");

// Create order
router.post("/create", authenticateJWT, createOrder);

// Get orders
router.get("/", authenticateJWT, getOrders);

module.exports = router;