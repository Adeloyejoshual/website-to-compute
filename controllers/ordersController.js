const { pool } = require('../server');
const { updateSellerWallet } = require('./walletsController');

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: orderRows } = await client.query('SELECT * FROM orders WHERE id=$1', [orderId]);
    if (orderRows.length === 0) throw new Error('Order not found');

    await client.query('UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2', [status, orderId]);

    // If order delivered/paid, update seller wallets
    if (status === 'delivered' || status === 'paid') {
      const { rows: items } = await client.query('SELECT product_id, quantity, price, seller_id FROM order_items WHERE order_id=$1', [orderId]);
      for (let item of items) {
        const payout = item.price * item.quantity;
        await updateSellerWallet(item.seller_id, payout);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = { updateOrderStatus };