import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- API routes ---

app.get("/api/products", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

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

// --- Serve frontend ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Vite build folder
app.use(express.static(path.join(__dirname, "dist")));

// Redirect all non-API requests to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 MiniMart running on port ${PORT}`);
});