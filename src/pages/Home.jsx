// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all marketplace products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, price, marketplace_type")
          .eq("status", "active")
          .eq("marketplace_type", "marketplace") // Only marketplace
          .limit(20)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px" }}>
      <h1>Marketplace Products</h1>

      {loading && <p>Loading products...</p>}
      {!loading && products.length === 0 && <p>No products found.</p>}

      <div style={{ display: "grid", gap: 16 }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 6,
              padding: 12,
            }}
          >
            <h3>{p.name}</h3>
            <p>₦{Number(p.price).toLocaleString()}</p>
            <p>Type: {p.marketplace_type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}