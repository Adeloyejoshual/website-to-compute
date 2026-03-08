import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          title,
          name,
          price,
          marketplace_type,
          product_images(image_url)
        `)
        .eq("marketplace_type", "marketplace")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <h1>🏪 Marketplace</h1>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 20 }}>
          {products.map(p => (
            <div key={p.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
              <img
                src={p.product_images?.[0]?.image_url || "https://via.placeholder.com/150"}
                alt={p.title || p.name || "Product"}
                style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 6 }}
              />
              <h3>{p.title || p.name || "Unnamed Product"}</h3>
              <p>₦{Number(p.price).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}