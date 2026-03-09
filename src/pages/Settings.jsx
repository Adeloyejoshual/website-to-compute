// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Settings({ session }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const userId = session.user.id;

  // Fetch user's products
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("❌ " + error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchProducts();
  }, [userId]);

  // Delete a product
  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    // Delete associated images first
    const { error: imgError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId);

    if (imgError) {
      console.error(imgError);
      setMessage("❌ Failed to delete images: " + imgError.message);
      return;
    }

    // Delete product
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error(error);
      setMessage("❌ Failed to delete product: " + error.message);
    } else {
      setMessage("✅ Product deleted successfully!");
      fetchProducts(); // Refresh list
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h2>My Products</h2>

      {message && <p style={{ marginBottom: 12 }}>{message}</p>}

      {loading ? (
        <p>Loading your products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 6,
              }}
            >
              <div>
                <strong>{product.title || "Untitled Product"}</strong> <br />
                ₦{product.price}
              </div>

              <button
                style={{ background: "#ff4d4f", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}
                onClick={() => handleDelete(product.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}