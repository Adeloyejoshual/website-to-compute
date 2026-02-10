import React, { useState, useEffect } from "react";
import Products from "./pages/Products.jsx";
import axios from "axios";

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "" });

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle add product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/products", {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
      });
      setProducts([res.data, ...products]);
      setForm({ name: "", description: "", price: "" });
    } catch (err) {
      console.error("Error adding product:", err.response?.data || err.message);
      alert(err.response?.data || err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>MiniMart</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="number"
          step="0.01"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          style={{ marginRight: "0.5rem" }}
        />
        <button type="submit">Add Product</button>
      </form>

      <Products products={products} />
    </div>
  );
}