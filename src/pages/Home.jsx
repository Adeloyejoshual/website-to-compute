import React, { useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);

    // Fetch products with images
    const { data: productsData, error } = await supabase
      .from("products")
      .select(`*, product_images(*)`);

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(productsData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Optionally: realtime subscription to products table
    const subscription = supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("Change received!", payload);
          fetchProducts(); // refresh on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <h1>Marketplace Products</h1>
      {products.length === 0 && <p>No products found.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
            {/* Show main product image if exists */}
            {p.product_images?.length > 0 && (
              <img
                src={p.product_images[0].image_url}
                alt={p.name}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
            )}
            <h3>{p.name}</h3>
            <p>Price: ₦{p.price}</p>
            <p>Seller: {p.seller_id} ({p.seller_type})</p>

            {/* Dynamic fields */}
            <div>
              {Object.entries(p)
                .filter(
                  ([key, value]) =>
                    !["id", "created_at", "name", "description", "price", "seller_id", "category_id", "is_public", "seller_type", "product_images"].includes(key) &&
                    value
                )
                .map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.replace("_", " ")}:</strong> {value}
                  </p>
                ))}
            </div>

            <p>{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}