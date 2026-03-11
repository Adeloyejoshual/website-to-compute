const { pool } = require('../server');

// Place an order
const placeOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, items, payment_reference } = req.body;
    // items = [{ product_id, quantity }]

    await client.query('BEGIN');

    // Calculate total
    let totalAmount = 0;
    for (let item of items) {
      const { rows } = await client.query('SELECT price, seller_id FROM products WHERE id=$1', [item.product_id]);
      if (rows.length === 0) throw new Error('Product not found');
      totalAmount += rows[0].price * item.quantity;
      item.seller_id = rows[0].seller_id;
      item.price = rows[0].price;
    }

    // Create order
    const { rows: orderRows } = await client.query(
      'INSERT INTO orders (user_id, total_amount, status, payment_reference) VALUES ($1,$2,$3,$4) RETURNING *',
      [user_id, totalAmount, 'pending', payment_reference]
    );
    const orderId = orderRows[0].id;

    // Add order items
    for (let item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, seller_id) VALUES ($1,$2,$3,$4,$5)',
        [orderId, item.product_id, item.quantity, item.price, item.seller_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ order: orderRows[0], items });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { placeOrder, getUserOrders };