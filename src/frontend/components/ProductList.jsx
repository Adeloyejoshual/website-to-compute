import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "/products";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    const listener = () => fetchProducts();
    window.addEventListener("product-added", listener);
    return () => window.removeEventListener("product-added", listener);
  }, []);

  return (
    <div>
      <h2>Products</h2>
      {products.length === 0 && <p>No products yet.</p>}
      <ul>
        {products.map(p => (
          <li key={p.id} style={{ marginBottom: "15px", border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
            <strong>{p.title}</strong> - ${p.price}<br />
            {p.description && <span>{p.description}</span>}<br />
            {p.image && <img src={p.image} alt={p.title} style={{ width: "100px", marginTop: "5px" }} />}
          </li>
        ))}
      </ul>
    </div>
  );
}