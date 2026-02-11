import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

// --- CockroachDB connection ---
const pool = new Pool({
  connectionString: process.env.COCKROACH_URI,
  ssl: { rejectUnauthorized: false }, // Required for Render + CockroachDB
});

// Test DB connection
(async () => {
  try {
    await pool.connect();
    console.log("✅ Connected to CockroachDB");
  } catch (err) {
    console.error("❌ DB connection error:", err);
    process.exit(1); // Stop server if DB fails
  }
})();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, description, price, created_at FROM products ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/products error:", err);
    res.status(500).json({ error: "Server error fetching products" });
  }
});

// POST new product
app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({ error: "Price must be a valid number" });
    }

    // Map frontend 'name' to DB 'title'
    const query = `
      INSERT INTO products (title, description, price)
      VALUES ($1, $2, $3)
      RETURNING id, title, description, price, created_at
    `;
    const { rows } = await pool.query(query, [name.trim(), description?.trim() || null, numericPrice]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /api/products error:", err);
    res.status(500).json({ error: "Error adding product" });
  }
});

// --- Serve frontend ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 MiniMart running on port ${PORT}`);
});