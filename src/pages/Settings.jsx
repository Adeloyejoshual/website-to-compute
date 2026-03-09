
// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const getImageUrl = (publicId, format="jpg") => `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}.${format}`;

export default function Settings({ session }) {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const userId = session.user.id;

  const fetchProducts = async () => {
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
    if(userId) fetchProducts(); 
  }, [userId]);

  const getImage = (productId) => images.find(i => i.product_id === productId && i.is_primary);

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const productImages = images.filter(i => i.product_id === productId);
      const publicIds = productImages.map(i => i.public_id);

      if(publicIds.length) {
        const res = await fetch("https://your-backend.com/delete-product-images", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({publicIds})
        });
        if(!res.ok) throw new Error("Failed to delete images from Cloudinary");
      }

      const { error: imgError } = await supabase.from("product_images").delete().eq("product_id", productId);
      if(imgError) throw imgError;

      const { error: productError } = await supabase.from("products").delete().eq("id", productId);
      if(productError) throw productError;

      setMessage("✅ Product deleted successfully!");
      fetchProducts();
    } catch(err) {
      console.error(err);
      setMessage("❌ Delete failed: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h2>My Products</h2>
      {message && <p style={{ marginBottom: 12, padding: 8, background: "#f0f9ff", borderRadius: 6, borderLeft: "3px solid #3b82f6" }}>{message}</p>}
      
      {loading ? (
        <p style={{ textAlign: "center", padding: "40px", fontSize: "1.1em" }}>Loading your products...</p>
      ) : products.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px", color: "#666", fontSize: "1.1em" }}>No products found. <a href="/add" style={{ color: "#3b82f6", textDecoration: "none" }}>Add your first product →</a></p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            gap: "20px"
          }}
        >
          {products.map(product => {
            const image = getImage(product.id);
            return (
              <div
                key={product.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "10px",
                  background: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
              >
                {image ? (
                  <img
                    src={getImageUrl(image.public_id)}
                    alt={product.title || "Product"}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      marginBottom: "10px"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "150px",
                      background: "#f3f3f3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "6px",
                      marginBottom: "10px",
                      color: "#999",
                      fontSize: "0.9em"
                    }}
                  >
                    No Image
                  </div>
                )}

                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1em" }}>
                  {product.title || "Untitled Product"}
                </h3>

                <p style={{ margin: "0 0 12px 0", fontSize: "1.2em", fontWeight: 600, color: "#059669" }}>
                  ₦{Number(product.price).toLocaleString()}
                </p>

                <button 
                  style={{ 
                    width: "100%", 
                    background: "#ef4444", 
                    color: "#fff", 
                    border: "none", 
                    padding: "8px 12px", 
                    borderRadius: "6px", 
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "background 0.2s"
                  }} 
                  onClick={() => handleDelete(product.id)}
                  onMouseEnter={(e) => e.target.style.background = "#dc2626"}
                  onMouseLeave={(e) => e.target.style.background = "#ef4444"}
                >
                  Delete Product
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}