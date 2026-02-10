import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { addProduct, getProducts } from "./db.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

// Add product
app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !price) return res.status(400).send("Name and price required");

    const product = await addProduct(name, description || "", parseFloat(price));
    res.json(product);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).send("Error adding product");
  }
});

// Get products
app.get("/api/products", async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Error fetching products");
  }
});

// Serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`MiniMart running on port ${PORT}`);
});