import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const res = await axios.get("/products");
    setProducts(res.data);
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
          <li key={p.id}>{p.title} - ${p.price}<br/>{p.description}</li>
        ))}
      </ul>
    </div>
  );
}