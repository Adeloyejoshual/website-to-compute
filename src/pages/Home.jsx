import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        title,
        price,
        product_images(image_url)
      `)
      .eq("marketplace_type", "marketplace")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
    } else {
      setProducts(data || []);
    }
  }

  const filtered = products.filter((p) =>
    (p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "20px" }}>
      <h1>Marketplace</h1>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
        }}
      />

      {filtered.length === 0 && <p>No products found.</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
          gap: "20px",
        }}
      >
        {filtered.map((p) => {
          const image = p.product_images?.[0]?.image_url;

          return (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt={p.title}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "150px",
                    background: "#f2f2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                  }}
                >
                  No Image
                </div>
              )}

              <h3 style={{ marginTop: "10px" }}>
                {p.title || "Untitled Product"}
              </h3>

              <p>₦{Number(p.price).toLocaleString()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}