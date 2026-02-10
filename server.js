// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB, addProduct, getProducts } from "./db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB tables
await initDB();

// Routes
app.get("/", (req, res) => res.send("MiniMart API is running"));

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err.stack);
    res.status(500).send("Error fetching products");
  }
});

// Add product
app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    console.log("Received product:", req.body);

    const product = await addProduct(name, description, price);
    console.log("Product added:", product);

    res.json(product);
  } catch (err) {
    console.error("Error adding product:", err.stack);
    res.status(500).send(err.message);
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));