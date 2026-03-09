// src/pages/Settings.jsx - ✅ FULLY WORKING with your backend
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const getImageUrl = (publicId, format="jpg") => `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}.${format}`;

export default function Settings({ session }) {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState({}); // Track per-product delete state

  const userId = session?.user?.id;
  const BACKEND_URL = "https://website-to-compute-1mzb.onrender.com";

  const fetchProducts = async () => {
    if (!userId) return;
    
    setLoading(true);
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id,title,price")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });
    
    if (productsError) { 
      console.error(productsError); 
      setLoading(false); 
      return; 
    }

    const { data: imagesData, error: imagesError } = await supabase
      .from("product_images")
      .select("id,product_id,public_id,is_primary");
    if (imagesError) console.error(imagesError);

    setProducts(productsData || []);
    setImages(imagesData || []);
    setLoading(false);
  };

  useEffect(() => { 
    if (userId) fetchProducts(); 
  }, [userId]);

  const getImage = (productId) => images.find(i => i.product_id === productId && i.is_primary);

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product and its images?")) return;

    setDeleting(prev => ({ ...prev, [productId]: true }));
    setMessage("");

    try {
      // 1. Get product images
      const productImages = images.filter(i => i.product_id === productId);
      const publicIds = productImages.map(i => i.public_id);
      
      console.log("Deleting publicIds:", publicIds);

      // 2. Delete from Cloudinary (your backend)
      if (publicIds.length > 0) {
        const res = await fetch(`${BACKEND_URL}/delete-product-images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicIds })
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Cloudinary delete failed:", errorText);
          throw new Error(`Cloudinary delete failed: ${res.status} ${errorText}`);
        }
        console.log("✅ Cloudinary images deleted");
      }

      // 3. Delete Supabase records
      const { error: imgError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);
      if (imgError) throw imgError;

      const { error: productError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      if (productError) throw productError;

      setMessage("✅ Product and images deleted successfully!");
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error("Delete error:", err);
      setMessage(`❌ Delete failed: ${err.message}`);
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
          borderLeft: `4px solid ${message.includes("✅") ? "#10b981" : "#ef4444"}`,
          color: message.includes("✅") ? "#166534" : "#991b1b"
        }}>
          {message}
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
          <p style={{ color: "#6b7280", fontSize: "1.1em" }}>Loading your products...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
          <div style={{ width: 80, height: 80, background: "#f3f4f6", borderRadius: "50%", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2em" }}>📦</div>
          <p style={{ fontSize: "1.1em", marginBottom: 12 }}>No products found.</p>
          <a href="/add" style={{ 
            padding: "12px 24px", 
            background: "#3b82f6", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: 8, 
            fontWeight: 500 
          }}>
            Add your first product →
          </a>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          gap: "20px"
        }}>
          {products.map(product => {
            const image = getImage(product.id);
            const isDeleting = deleting[product.id];
            
            return (
              <div key={product.id} style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px",
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.2s"
              }}>
                <div style={{ marginBottom: 12 }}>
                  {image ? (
                    <img
                      src={getImageUrl(image.public_id)}
                      alt={product.title}
                      style={{
                        width: "100%",
                        height: "140px",
                        objectFit: "cover",
                        borderRadius: "8px"
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{
                      height: "140px",
                      background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                      fontSize: "0.85em",
                      position: "relative"
                    }}>
                      <span>📦 No Image</span>
                    </div>
                  )}
                </div>

                <h3 style={{ 
                  margin: "0 0 8px 0", 
                  fontSize: "1.05em", 
                  fontWeight: 600,
                  lineHeight: "1.3",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {product.title || "Untitled Product"}
                </h3>

                <p style={{ 
                  margin: "0 0 16px 0", 
                  fontSize: "1.25em", 
                  fontWeight: 700, 
                  color: "#059669" 
                }}>
                  ₦{Number(product.price || 0).toLocaleString()}
                </p>

                <button 
                  style={{ 
                    width: "100%", 
                    background: isDeleting ? "#6b7280" : "#ef4444", 
                    color: "#fff", 
                    border: "none", 
                    padding: "10px 16px", 
                    borderRadius: "8px", 
                    cursor: isDeleting ? "not-allowed" : "pointer",
                    fontWeight: 500,
                    fontSize: "0.9em",
                    transition: "all 0.2s"
                  }} 
                  onClick={() => handleDelete(product.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span style={{ marginRight: 8 }}>⏳</span>
                      Deleting...
                    </>
                  ) : (
                    "🗑️ Delete Product"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}