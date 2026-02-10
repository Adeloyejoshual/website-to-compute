import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { pool } from "./db.js"; // our db helper

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist"))); // serve built frontend

// === CockroachDB Helpers ===
async function addProduct(name, description, price) {
  const query = `
    INSERT INTO products (name, description, price)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [name, description, price];
  const res = await pool.query(query, values);
  return res.rows[0];
}

async function getProducts() {
  const res = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
  return res.rows;
}

// Test DB connection on startup
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("CockroachDB connected:", res.rows[0]);
  } catch (err) {
    console.error("CockroachDB connection error:", err);
  }
})();

// === API Routes ===

// Add a new product
app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !price) return res.status(400).send("Name and price required");
    const product = await addProduct(name, description || "", price);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding product");
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching products");
  }
});

// Serve frontend for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`MiniMart running on port ${PORT}`);
});