// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Temporary in-memory product store =====
let products = [];

// ===== API Routes =====

// Get all products
app.get("/products", (req, res) => {
  res.json(products);
});

// Add a new product
app.post("/products", (req, res) => {
  const { title, price, description } = req.body;
  if (!title || !price) {
    return res.status(400).json({ error: "Title and price are required" });
  }

  const product = { id: Date.now(), title, price, description };
  products.push(product);

  // Notify frontend (optional)
  res.status(201).json(product);
});

// ===== Serve prebuilt React frontend =====
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`MiniMart server running on port ${PORT}`);
});