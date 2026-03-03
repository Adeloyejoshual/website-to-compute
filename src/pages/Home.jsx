import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, product_images(image_url)");
      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by name
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>Marketplace</h1>

      {/* Simple search input */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />

      {/* Product list */}
      {filtered.length === 0 && <p>No products found.</p>}
      {filtered.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ddd",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: 8,
          }}
        >
          <h3>{p.name}</h3>
          <p>₦{p.price}</p>
          {p.product_images?.length > 0 && (
            <img
              src={p.product_images[0].image_url}
              alt={p.name}
              width={150}
              style={{ marginTop: "0.5rem" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}