const { pool } = require('../server');

// Get buyer wallet (if implemented)
const getBuyerWallet = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM buyer_wallets WHERE user_id=$1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Wallet not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Seller wallet retrieval (already implemented)
const getSellerWallet = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM seller_wallets WHERE user_id=$1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Wallet not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update seller wallet (already used in ordersController)
const updateSellerWallet = async (sellerId, amount) => {
  await pool.query(
    `UPDATE seller_wallets
     SET available_balance = available_balance + $1,
         total_earned = total_earned + $1
     WHERE user_id = $2`,
    [amount, sellerId]
  );
};

module.exports = { getBuyerWallet, getSellerWallet, updateSellerWallet };