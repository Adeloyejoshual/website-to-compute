const { pool } = require('../server');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id=$1', [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE users SET name=$1, email=$2, updated_at=NOW() WHERE id=$3 RETURNING id, name, email',
      [name, email, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user cart
const getCart = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.quantity, p.title, p.price, p.image 
       FROM carts c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id=$1`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO carts (user_id, product_id, quantity, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [req.user.id, product_id, quantity || 1]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  const { cartId } = req.params;
  try {
    await pool.query('DELETE FROM carts WHERE id=$1 AND user_id=$2', [cartId, req.user.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProfile, updateProfile, getCart, addToCart, removeFromCart };