const { pool } = require('../server');

// List all rewards
const getRewards = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM rewards ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Apply reward to order
const applyReward = async (orderId, rewardId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT discount_amount FROM rewards WHERE id=$1', [rewardId]);
    if (rows.length === 0) throw new Error('Reward not found');
    const discount = rows[0].discount_amount;

    await client.query(
      'UPDATE orders SET total_amount = total_amount - $1 WHERE id=$2',
      [discount, orderId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getRewards, applyReward };