import React, { useState } from "react";
import axios from "axios";

const API_URL = "/products";

export default function ProductForm() {
  const [form, setForm] = useState({ title: "", description: "", price: "", image: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(API_URL, form);
      alert("Product added!");
      setForm({ title: "", description: "", price: "", image: "" });
      window.dispatchEvent(new Event("product-added"));
    } catch (err) {
      console.error(err);
      alert("Failed to add product");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
      <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
      <button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Product"}</button>
    </form>
  );
}