import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`id, title, price, product_images(image_url)`)
        .eq("marketplace_type", "marketplace")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setProducts(data || []);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    (p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>Marketplace</h1>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 16 }}
      />

      {filtered.length === 0 && <p>No products found.</p>}

      {filtered.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ddd",
            padding: 16,
            marginBottom: 12,
            borderRadius: 8,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <img
            src={p.product_images?.[0]?.image_url || ""}
            alt={p.title}
            width={80}
            height={80}
            style={{ objectFit: "cover", borderRadius: 6 }}
          />
          <div>
            <h3>{p.title || "Unnamed Product"}</h3>
            <p>₦{Number(p.price).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}