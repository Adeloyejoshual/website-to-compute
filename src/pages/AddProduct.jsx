// src/pages/AddProduct.jsx - ✅ FIXED UNSIGNED UPLOAD + public_id
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function AddProduct({ session }) {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // ✅ FIXED: Unsigned upload - ONLY allowed parameters
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    // ✅ NO use_filename/unique_filename - handled by preset

    console.log("📤 Uploading:", file.name);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    console.log("☁️ Cloudinary response:", data);

    if (!res.ok || !data.secure_url) {
      throw new Error(data.error?.message || "Upload failed");
    }

    // ✅ Returns BOTH for perfect Settings delete
    return {
      image_url: data.secure_url,    // Homepage + Settings display
      public_id: data.public_id      // Settings delete
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) return setMessage("❌ Please log in");
    if (!title.trim()) return setMessage("❌ Title required");
    if (!price || Number(price) <= 0) return setMessage("❌ Valid price required");
    if (images.length === 0) return setMessage("❌ Add at least one image");

    setLoading(true);
    setMessage("");

    try {
      // 1. Create product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert([{
          title: title.trim(),
          price: Number(price),
          seller_id: userId,
          seller_type: "public",
          marketplace_type: "marketplace",
          status: "active",
          stock: 1
        }])
        .select()
        .single();

      if (productError) throw productError;
      console.log("✅ Product ID:", product.id);

      // 2. Upload all images
      const imageRecords = [];
      for (let i = 0; i < images.length; i++) {
        const result = await uploadImage(images[i]);
        
        imageRecords.push({
          product_id: product.id,
          seller_id: userId,
          image_url: result.image_url,     // ✅ Display
          public_id: result.public_id,     // ✅ Delete
          is_primary: i === 0,
          position: i + 1
        });
      }

      // 3. Batch insert images
      const { error: imgError } = await supabase
        .from("product_images")
        .insert(imageRecords);

      if (imgError) throw imgError;

      console.log("✅ Saved", imageRecords.length, "images");

      // 4. Success
      setMessage(`✅ "${title}" added with ${images.length} images!`);
      setTitle(""); setPrice(""); setImages([]);
      document.querySelector('input[type="file"]').value = "";

    } catch (err) {
      console.error("❌ Error:", err);
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 500, margin: "40px auto", padding: 24, 
      borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      background: "#fff"
    }}>
      <h2 style={{ marginBottom: 24, color: "#1f2937", textAlign: "center" }}>
        Add New Product
      </h2>
      
      {message && (
        <div style={{
          padding: 12, marginBottom: 20, borderRadius: 8,
          background: message.includes("✅") ? "#d1fae5" : "#fee2e2",
          borderLeft: `4px solid ${message.includes("✅") ? "#10b981" : "#ef4444"}`
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input
          type="text"
          placeholder="Product Title *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{
            padding: "14px", border: "1px solid #d1d5db", borderRadius: 8,
            fontSize: 16, transition: "border-color 0.2s"
          }}
          required
        />
        
        <input
          type="number"
          min="0" step="0.01"
          placeholder="Price (₦) *"
          value={price}
          onChange={e => setPrice(e.target.value)}
          style={{
            padding: "14px", border: "1px solid #d1d5db", borderRadius: 8,
            fontSize: 16
          }}
          required
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ padding: "14px", border: "2px dashed #d1d5db", borderRadius: 8 }}
        />

        {images.length > 0 && (
          <div style={{
            display: "flex", gap: 12, flexWrap: "wrap", padding: 16,
            background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0"
          }}>
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt={`Preview ${i+1}`}
                style={{
                  width: 80, height: 80, objectFit: "cover",
                  borderRadius: 8, border: "2px solid #3b82f6"
                }}
              />
            ))}
            <span style={{ alignSelf: "center", color: "#6b7280" }}>
              {images.length} image(s)
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !userId || images.length === 0}
          style={{
            padding: "16px", background: "#10b981", color: "white",
            border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s"
          }}
        >
          {loading ? "⏳ Adding..." : `➕ Add Product + ${images.length} Images`}
        </button>
      </form>
    </div>
  );
}