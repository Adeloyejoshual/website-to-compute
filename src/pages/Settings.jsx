// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Settings({ session }) {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const userId = session.user.id;

  // Fetch user's products and their images
  const fetchProducts = async () => {
    setLoading(true);

    // 1️⃣ Load products
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id,title,price")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error(productsError);
      setMessage("❌ " + productsError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Load images
    const { data: imagesData, error: imagesError } = await supabase
      .from("product_images")
      .select("product_id,image_url,is_primary");

    if (imagesError) {
      console.error(imagesError);
      setMessage("❌ " + imagesError.message);
    }

    setProducts(productsData || []);
    setImages(imagesData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchProducts();
  }, [userId]);

  const getImage = (productId) => {
    const img = images.find((i) => i.product_id === productId && i.is_primary);
    return img?.image_url;
  };

  // Delete a product and its images
  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    // Delete images first
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
          {products.map((product) => {
            const image = getImage(product.id);

            return (
              <div
                key={product.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {image ? (
                    <img
                      src={image}
                      alt={product.title || "Untitled"}
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        background: "#f3f3f3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 6,
                        fontSize: 12,
                        color: "#999",
                      }}
                    >
                      No Image
                    </div>
                  )}

                  <div>
                    <strong>{product.title || "Untitled Product"}</strong>
                    <p>₦{Number(product.price).toLocaleString()}</p>
                  </div>
                </div>

                <button
                  style={{
                    background: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}