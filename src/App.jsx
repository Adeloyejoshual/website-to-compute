import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "" });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return alert("Name and price required");

    try {
      await axios.post("/api/products", {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price)
      });
      setForm({ name: "", description: "", price: "" });
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Error adding product");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>MiniMart</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input type="text" name="description" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="number" name="price" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
        <button type="submit">Add Product</button>
      </form>

      <h2>Products</h2>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            <strong>{p.name}</strong> - ${p.price}<br />
            <small>{p.description}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);