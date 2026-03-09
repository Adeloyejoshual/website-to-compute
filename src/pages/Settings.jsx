import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Settings({ session }) {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { message, type, undo }
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // store product info temporarily
  const UNDO_TIMEOUT = 5000; // 5 seconds

  const userId = session.user.id;

  const fetchProducts = async () => {
    setLoading(true);
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id,title,price")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (productsError) {
      showToast("❌ " + productsError.message, "error");
      setLoading(false);
      return;
    }

    const { data: imagesData, error: imagesError } = await supabase
      .from("product_images")
      .select("product_id,image_url,is_primary");

    if (imagesError) showToast("❌ " + imagesError.message, "error");

    setProducts(productsData || []);
    setImages(imagesData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchProducts();
  }, [userId]);

  const getImage = (productId) => images.find((i) => i.product_id === productId && i.is_primary)?.image_url;

  const showToast = (message, type = "success", undo = null) => {
    setToast({ message, type, undo });
    setTimeout(() => setToast(null), UNDO_TIMEOUT);
  };

  const commitDelete = async (product) => {
    try {
      const productImages = images.filter((i) => i.product_id === product.id);

      // 1️⃣ Delete images from Cloudinary in parallel
      const deletePromises = productImages.map((img) => {
        if (!img.image_url) return null;
        const urlParts = img.image_url.split("/");
        const fileName = urlParts.pop();
        const folder = urlParts.slice(7).join("/");
        const publicId = folder ? `${folder}/${fileName.split(".")[0]}` : fileName.split(".")[0];

        return fetch("/api/deleteImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId }),
        });
      });
      await Promise.all(deletePromises);

      // 2️⃣ Delete images from Supabase
      await supabase.from("product_images").delete().eq("product_id", product.id);

      // 3️⃣ Delete product from Supabase
      await supabase.from("products").delete().eq("id", product.id);

      showToast("✅ Product permanently deleted!", "success");
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to delete product: " + err.message, "error");
    }
  };

  const handleDelete = (product) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setPendingDelete(product);
    showToast(
      `🕒 Deleted "${product.title}"`,
      "success",
      () => undoDelete(product)
    );

    // Wait UNDO_TIMEOUT before committing deletion
    setTimeout(() => {
      if (pendingDelete?.id === product.id) {
        commitDelete(product);
        setPendingDelete(null);
      }
    }, UNDO_TIMEOUT);
  };

  const undoDelete = (product) => {
    setPendingDelete(null);
    showToast(`↩️ "${product.title}" restored`, "success");
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
            const isDeleting = deleting || (pendingDelete?.id === product.id);

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