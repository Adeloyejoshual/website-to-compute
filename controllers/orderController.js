const { pool } = require("../server");

// ==============================
// Create Order
// ==============================
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware
    const { items, totalAmount, sellerId, paymentReference } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items required" });
    }

    if (!totalAmount || !sellerId) {
      return res.status(400).json({ message: "Total amount and sellerId required" });
    }

    // Insert order
    const orderQuery = `
      INSERT INTO orders (user_id, total_amount, seller_id, payment_reference)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, total_amount, status, created_at
    `;
    const orderValues = [userId, totalAmount, sellerId, paymentReference || null];
    const { rows: orderRows } = await pool.query(orderQuery, orderValues);
    const order = orderRows[0];

    // Insert order items
    const itemQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES ($1, $2, $3, $4)
    `;
    for (const item of items) {
      await pool.query(itemQuery, [order.id, item.productId, item.quantity, item.price]);
    }

    res.status(201).json({ message: "Order created successfully", order });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// ==============================
// Get Orders (User or Admin)
// ==============================
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query;
    let values = [];

    if (role === "admin") {
      query = "SELECT * FROM orders ORDER BY created_at DESC";
    } else {
      query = "SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC";
      values = [userId];
    }

    const { rows } = await pool.query(query, values);
    res.json(rows);

  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = { createOrder, getOrders };