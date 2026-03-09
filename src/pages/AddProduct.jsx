import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AddProduct() {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  // Handle multiple files
  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // Convert file to base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  // Upload to serverless API
  const uploadImage = async (file) => {
    const base64 = await fileToBase64(file);
    const res = await fetch("/api/uploadImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64 }),
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  // Show toast helper
  const showToast = (message, type = "success", duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return showToast("❌ Please log in first.", "error");
    if (!title.trim() || !price) return showToast("❌ Title and Price are required.", "error");

    setLoading(true);

    try {
      // Insert product
      const { data: product, error } = await supabase
        .from("products")
        .insert([{
          title: title.trim(),
          price: Number(price),
          seller_id: userId,
          seller_type: "public",
          marketplace_type: "marketplace",
          status: "active",
          stock: 1,
        }])
        .select()
        .single();
      if (error) throw error;

      // Upload all images in parallel
      const urls = await Promise.all(images.map(uploadImage));

      // Insert image records
      await Promise.all(
        urls.map((url, i) =>
          supabase.from("product_images").insert({
            product_id: product.id,
            image_url: url,
            is_primary: i === 0,
            position: i + 1,
          })
        )
      );

      showToast("✅ Product added successfully!");
      setTitle("");
      setPrice("");
      setImages([]);
    } catch (err) {
      console.error(err);
      showToast("❌ " + err.message, "error");
    }

    setLoading(false);
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img));
  }, [images]);

  return (
    <div style={{ maxWidth: 450, margin: "40px auto" }}>
      <h2>Add Product</h2>
      <form style={{ display: "flex", flexDirection: "column", gap: 12 }} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input type="file" accept="image/*" multiple onChange={handleFileChange} />

        {/* Preview images */}
        {images.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(img)}
                alt={`preview-${idx}`}
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }}
              />
            ))}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

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
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}