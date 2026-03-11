const { pool } = require('../server');

// Create Product with optional image
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category_id, seller_id, stock } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.location; // S3 URL
    }

    const query = `
      INSERT INTO products (title, description, price, category_id, seller_id, stock, image)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `;
    const values = [title, description, price, category_id, seller_id, stock || 0, imageUrl];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createProduct, getProducts };