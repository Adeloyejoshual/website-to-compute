// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const BACKEND_URL = "https://website-to-compute-1mzb.onrender.com";

export default function Settings({ session }) {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState({});

  const userId = session?.user?.id;

  // Fetch products + images
  const fetchProducts = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id,title,price")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });
      if (productsError) throw productsError;

      const { data: imagesData, error: imagesError } = await supabase
        .from("product_images")
        .select("id,product_id,image_url,public_id,is_primary")
        .eq("seller_id", userId);
      if (imagesError) console.error(imagesError);

      setProducts(productsData || []);
      setImages(imagesData || []);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userId) fetchProducts(); }, [userId]);

  // Get main image for product
  const getImage = (productId) => images.find(i => i.product_id === productId && i.is_primary);
  const getImageSrc = (image) => image?.image_url || null;
  const getPublicId = (image) => image?.public_id || null;

  // Delete product + images
  const handleDelete = async (productId) => {
    if (!confirm("Delete this product and its images from Cloudinary?")) return;
    setDeleting(prev => ({ ...prev, [productId]: true }));
    setMessage("");

    try {
      const productImages = images.filter(i => i.product_id === productId);
      const publicIds = productImages.map(getPublicId).filter(Boolean);

      // 1️⃣ Delete from Cloudinary
      if (publicIds.length > 0) {
        const res = await fetch(`${BACKEND_URL}/delete-product-images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicIds })
        });
        if (!res.ok) console.error("Cloudinary deletion failed");
      }

      // 2️⃣ Delete from Supabase
      await supabase.from("product_images").delete().eq("product_id", productId);
      await supabase.from("products").delete().eq("id", productId);

      setMessage("✅ Product and images deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      setMessage(`❌ Error deleting product: ${err.message}`);
    } finally {
      setDeleting(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h2 style={{ marginBottom: 24, color: "#1f2937" }}>My Products</h2>

      {message && (
        <div style={{
          marginBottom: 20,
          padding: 12,
          background: message.includes("✅") ? "#dcfce7" : "#fee2e2",
          borderRadius: 8,
          borderLeft: `4px solid ${message.includes("✅") ? "#10b981" : "#ef4444"}`
        }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{
            width: 40, height: 40,
            border: "3px solid #e5e7eb",
            borderTop: "3px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }} />
          <p style={{ color: "#6b7280" }}>Loading your products...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "3em", marginBottom: 16 }}>📦</div>
          <p>No products found. <a href="/add" style={{ color: "#3b82f6" }}>Add product →</a></p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "20px" }}>
          {products.map(product => {
            const image = getImage(product.id);
            const imageSrc = getImageSrc(image);
            const isDeleting = deleting[product.id];

            return (
              <div key={product.id} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", background: "#fff" }}>
                {imageSrc ? (
                  <img src={imageSrc} alt={product.title} style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px" }} loading="lazy" />
                ) : (
                  <div style={{ height: "140px", background: "#f3f3f3", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", color: "#999" }}>
                    No Image
                  </div>
                )}

                <h3 style={{ margin: "8px 0", fontWeight: 600 }}>{product.title}</h3>
                <p style={{ fontSize: "1.25em", fontWeight: 700, color: "#059669", margin: "8px 0 16px 0" }}>
                  ₦{Number(product.price).toLocaleString()}
                </p>

                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={isDeleting}
                  style={{
                    width: "100%",
                    background: isDeleting ? "#6b7280" : "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: isDeleting ? "not-allowed" : "pointer"
                  }}
                >
                  {isDeleting ? "⏳ Deleting..." : "🗑️ Delete Product"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}