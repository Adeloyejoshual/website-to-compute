import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- API endpoints ---

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Add a product
app.post("/api/products", async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *",
      [name, description, price]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding product");
  }
});

// Optional: get categories
app.get("/api/categories", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 MiniMart API running on port ${PORT}`);
});