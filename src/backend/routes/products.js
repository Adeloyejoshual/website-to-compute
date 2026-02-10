const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all products
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST new product
router.post("/", async (req, res) => {
  const { title, description, price, image } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO products (title, description, price, image) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, price, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

module.exports = router;