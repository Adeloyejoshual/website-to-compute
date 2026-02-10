import React, { useState } from "react";
import axios from "axios";

export default function ProductForm() {
  const [form, setForm] = useState({ title: "", price: "", description: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.post("/products", form);
    setForm({ title: "", price: "", description: "" });
    window.dispatchEvent(new Event("product-added"));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <button type="submit">Add Product</button>
    </form>
  );
}