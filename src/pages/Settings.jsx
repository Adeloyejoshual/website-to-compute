// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Settings({ session }) {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { message, type, undo }
  const [pendingDelete, setPendingDelete] = useState(null); // store product for undo
  const UNDO_TIMEOUT = 5000; // 5 seconds

  const userId = session.user.id;

  // Fetch products and images
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });
      if (productsError) throw productsError;

      const { data: imagesData, error: imagesError } = await supabase
        .from("product_images")
        .select("*");
      if (imagesError) throw imagesError;

      setProducts(productsData || []);
      setImages(imagesData || []);
    } catch (err) {
      console.error(err);
      showToast("❌ " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchProducts();
  }, [userId]);

  // Helper: show toast notifications
  const showToast = (message, type = "success", undo = null) => {
    setToast({ message, type, undo });
    setTimeout(() => setToast(null), UNDO_TIMEOUT);
  };

  // Get primary image for product
  const getImage = (productId) =>
    images.find((i) => i.product_id === productId && i.is_primary)?.image_url;

  // Commit product deletion
  const commitDelete = async (product) => {
    try {
      // Get all images for product
      const productImages = images.filter((i) => i.product_id === product.id);

      // Delete images from Cloudinary in parallel
      await Promise.all(
        productImages.map(async (img) => {
          if (!img.image_url) return;
          const urlParts = img.image_url.split("/");
          const fileName = urlParts.pop();
          const folder = urlParts.slice(7).join("/"); // adjust if you use folders
          const publicId = folder
            ? `${folder}/${fileName.split(".")[0]}`
            : fileName.split(".")[0];

          await fetch("/api/deleteImage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId }),
          });
        })
      );

      // Delete image rows in Supabase
      await supabase.from("product_images").delete().eq("product_id", product.id);

      // Delete product row in Supabase
      await supabase.from("products").delete().eq("id", product.id);

      showToast("✅ Product permanently deleted!", "success");
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to delete product: " + err.message, "error");
    }
  };

  // Handle delete click
  const handleDelete = (product) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setPendingDelete(product);

    showToast(
      `🕒 Deleted "${product.title}"`,
      "success",
      () => undoDelete()
    );

    // Commit delete after UNDO_TIMEOUT if not undone
    setTimeout(() => {
      if (pendingDelete?.id === product.id) {
        commitDelete(product);
        setPendingDelete(null);
      }
    }, UNDO_TIMEOUT);
  };

  const undoDelete = () => {
    setPendingDelete(null);
    showToast("↩️ Deletion undone", "success");
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", position: "relative" }}>
      <h2>My Products</h2>

      {loading ? (
        <p>Loading your products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {products.map((product) => {
            const image = getImage(product.id);
            const isDeleting = pendingDelete?.id === product.id;

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
                  opacity: isDeleting ? 0.6 : 1,
                  transition: "opacity 0.3s",
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
                  disabled={isDeleting}
                  style={{
                    background: isDeleting ? "#ccc" : "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 4,
                    cursor: isDeleting ? "not-allowed" : "pointer",
                  }}
                  onClick={() => handleDelete(product)}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            background: toast.type === "success" ? "#52c41a" : "#ff4d4f",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 6,
            boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>{toast.message}</span>
          {toast.undo && (
            <button
              onClick={toast.undo}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}