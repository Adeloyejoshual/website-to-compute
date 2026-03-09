import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function AddProduct({ session }) {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // URL.createObjectURL
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user?.id) setUserId(session.user.id);
  }, [session]);

  useEffect(() => {
    // Generate preview URLs
    const urls = images.map(file => URL.createObjectURL(file));
    setPreviews(urls);

    // Cleanup URLs on unmount / image change
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [images]);

  const handleFileChange = e => {
    setImages(Array.from(e.target.files));
  };

  const uploadImage = async file => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    if (!res.ok || !data.secure_url) throw new Error(data.error?.message || "Upload failed");

    return {
      image_url: data.secure_url,
      public_id: data.public_id
    };
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!userId) return setMessage("❌ Please log in");
    if (!title.trim()) return setMessage("❌ Title required");
    if (!price || Number(price) <= 0) return setMessage("❌ Valid price required");
    if (images.length === 0) return setMessage("❌ Add at least one image");

    setLoading(true);
    setMessage("");
    const uploadedImages = [];

    try {
      // 1️⃣ Insert product (RLS safe)
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert([{
          title: title.trim(),
          price: Number(price),
          seller_id: userId,
          status: "active",
          stock: 1
        }])
        .select()
        .single();
      if (productError) throw productError;

      // 2️⃣ Upload images one by one (can be upgraded to Promise.all)
      for (let i = 0; i < images.length; i++) {
        const result = await uploadImage(images[i]);
        uploadedImages.push(result);

        console.log(`✅ Uploaded image ${i+1}:`, result.image_url);
      }

      // 3️⃣ Insert image records into Supabase
      const imageRecords = uploadedImages.map((img, i) => ({
        product_id: product.id,
        seller_id: userId,
        image_url: img.image_url,
        public_id: img.public_id,
        is_primary: i === 0,
        position: i + 1
      }));

      const { error: imgError } = await supabase.from("product_images").insert(imageRecords);
      if (imgError) throw imgError;

      setMessage(`✅ "${title}" added with ${images.length} images!`);
      setTitle(""); setPrice(""); setImages([]); setPreviews([]);

    } catch (err) {
      console.error("❌ Error:", err);

      // Cleanup partially uploaded images from Cloudinary
      for (const img of uploadedImages) {
        await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
          method: "POST",
          body: JSON.stringify({ public_id: img.public_id }),
          headers: { "Content-Type": "application/json" }
        });
      }

      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: 40, padding: 24, borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", background: "#fff" }}>
      <h2 style={{ marginBottom: 24, color: "#1f2937", textAlign: "center" }}>Add New Product</h2>

      {message && (
        <div style={{
          padding: 12, marginBottom: 20, borderRadius: 8,
          background: message.includes("✅") ? "#d1fae5" : "#fee2e2",
          borderLeft: `4px solid ${message.includes("✅") ? "#10b981" : "#ef4444"}`
        }}>{message}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input type="text" placeholder="Product Title *" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="number" placeholder="Price (₦) *" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01" required />

        <input type="file" accept="image/*" multiple onChange={handleFileChange} />

        {previews.length > 0 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {previews.map((url, i) => (
              <img key={i} src={url} alt={`Preview ${i+1}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "2px solid #3b82f6" }} />
            ))}
          </div>
        )}

        <button type="submit" disabled={loading || !userId || images.length === 0}>
          {loading ? "⏳ Adding..." : `➕ Add Product + ${images.length} Images`}
        </button>
      </form>
    </div>
  );
}