// src/pages/AddProduct.jsx - ✅ PERFECTLY FIXED for public_id + Settings delete
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

  // ✅ Use session prop (faster + consistent with Settings)
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // ✅ FIXED: Return BOTH secure_url AND public_id
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    
    // ✅ IMPROVED: Better public_id generation
    formData.append("use_filename", true);
    formData.append("unique_filename", true);

    console.log("📤 Uploading:", file.name);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    console.log("☁️ Cloudinary response:", data);

    if (!res.ok || !data.secure_url) {
      throw new Error(data.error?.message || "Image upload failed");
    }

    // ✅ RETURN BOTH for Supabase
    return {
      image_url: data.secure_url,
      public_id: data.public_id
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) return setMessage("❌ Please log in first");
    if (!title.trim()) return setMessage("❌ Title required");
    if (!price || Number(price) <= 0) return setMessage("❌ Valid price required");
    if (images.length === 0) return setMessage("❌ At least one image required");

    setLoading(true);
    setMessage("");

    try {
      // 1️⃣ Create product
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
      if (!product?.id) throw new Error("Failed to create product");

      console.log("✅ Product created:", product.id);

      // 2️⃣ Upload images + SAVE public_id
      const imageRecords = [];
      for (let i = 0; i < images.length; i++) {
        const uploadResult = await uploadImage(images[i]);

        imageRecords.push({
          product_id: product.id,
          seller_id: userId,
          image_url: uploadResult.image_url,     // ✅ For display
          public_id: uploadResult.public_id,     // ✅ For delete (Settings!)
          is_primary: i === 0,
          position: i + 1
        });
      }

      // 3️⃣ Batch insert ALL images
      const { error: imgError } = await supabase
        .from("product_images")
        .insert(imageRecords);

      if (imgError) throw imgError;

      console.log("✅ Images saved with public_id:", imageRecords);

      // 4️⃣ SUCCESS - Reset form
      setMessage(`✅ Product "${title}" added with ${images.length} images!`);
      setTitle("");
      setPrice("");
      setImages([]);
      
      // Clear file input
      document.querySelector('input[type="file"]').value = "";

    } catch (err) {
      console.error("❌ Error:", err);
      setMessage("❌ " + (err.message || "Failed to add product"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 500, 
      margin: "40px auto", 
      padding: "20px", 
      borderRadius: 12, 
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
    }}>
      <h2 style={{ marginBottom: 24, color: "#1f2937" }}>Add New Product</h2>
      
      {message && (
        <div style={{
          padding: 12,
          marginBottom: 20,
          background: message.includes("✅") ? "#d1fae5" : "#fee2e2",
          borderRadius: 8,
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
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: "16px"
          }}
          required
        />
        
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price (₦) *"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: "16px"
          }}
          required
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ padding: "12px" }}
        />

        {images.length > 0 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: "12px", background: "#f8fafc", borderRadius: 8 }}>
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt={`Preview ${i + 1}`}
                style={{
                  width: 90,
                  height: 90,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "2px solid #3b82f6"
                }}
              />
            ))}
            <div style={{ 
              alignSelf: "center", 
              fontSize: "14px", 
              color: "#6b7280" 
            }}>
              {images.length} image(s)
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !userId}
          style={{
            padding: "14px",
            background: loading ? "#9ca3af" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: "16px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}
        >
          {loading ? "⏳ Adding Product..." : `➕ Add Product`}
        </button>
      </form>
    </div>
  );
}