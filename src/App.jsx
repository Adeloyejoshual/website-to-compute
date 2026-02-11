import React, { useState, useEffect } from "react";
import Products from "./pages/Products.jsx";
import axios from "axios";

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "" });

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      console.error(err);
      alert(err.response?.data || err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>MiniMart</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input type="text" name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        <input type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input type="number" step="0.01" name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
        <button type="submit">Add Product</button>
      </form>

      <Products products={products} />
    </div>
  );
}