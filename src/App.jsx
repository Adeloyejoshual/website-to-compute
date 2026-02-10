import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: ""
  });
  const [loading, setLoading] = useState(false);

  // Fetch products from backend
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

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return alert("Name and price required");
    setLoading(true);
    try {
      await axios.post("/api/products", form);
      setForm({ name: "", description: "", price: "" });
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>MiniMart</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <button type="submit" disabled={loading} style={{ padding: 10 }}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      <h2>Products</h2>
      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id} style={{ marginBottom: 10 }}>
              <strong>{p.name}</strong> - ${p.price} <br />
              <small>{p.description}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}