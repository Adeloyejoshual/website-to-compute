import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Join products with product_images (get first image only)
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            title,
            price,
            product_images!inner(image_url, is_primary)
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Map first image only
        const formatted = data.map((p) => ({
          ...p,
          image: p.product_images?.[0]?.image_url || null,
        }));

        setProducts(formatted);
      } catch (err) {
        console.error("Error fetching products:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
      <h1>Marketplace Products</h1>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 20,
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
                textAlign: "center",
              }}
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.title}
                  style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 6 }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f0f0f0",
                    borderRadius: 6,
                  }}
                >
                  📦 No Image
                </div>
              )}

              <h3 style={{ margin: "10px 0 5px" }}>{p.title}</h3>
              <p>₦{Number(p.price).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}