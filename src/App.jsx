import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "" });

  const fetchProducts = async () => {
    const res = await axios.get("/api/products");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/products", { name: form.name, description: form.description, price: parseFloat(form.price) });
    setForm({ name: "", description: "", price: "" });
    fetchProducts();
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>MiniMart</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input name="description" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input name="price" placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
        <button type="submit">Add Product</button>
      </form>

      <h2>Products</h2>
      <ul>
        {products.map(p => <li key={p.id}>{p.name} - ${p.price} <br />{p.description}</li>)}
      </ul>
    </div>
  );
}