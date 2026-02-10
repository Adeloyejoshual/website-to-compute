const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Temporary in-memory products
let products = [];

app.use(cors());
app.use(express.json());

// API routes
app.get("/products", (req, res) => res.json(products));

app.post("/products", (req, res) => {
  const product = { id: Date.now(), ...req.body };
  products.push(product);
  res.status(201).json(product);
});

// Serve React build
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));