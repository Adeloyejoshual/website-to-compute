import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// Cloudinary config from .env
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function AddProduct() {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // Upload image to Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return setMessage("❌ Please log in first.");
    if (!name || !price) return setMessage("❌ Name and Price are required.");

    setLoading(true);
    setMessage("");

    try {
      // 1️⃣ Insert product
      const { data: product, error } = await supabase
        .from("products")
        .insert([{
          name,
          title: name,               // fallback title
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

      // 2️⃣ Upload images
      for (let i = 0; i < images.length; i++) {
        const url = await uploadImage(images[i]);
        await supabase.from("product_images").insert([{
          product_id: product.id,
          image_url: url,
          is_primary: i === 0,
          position: i + 1,
        }]);
      }

      setMessage("✅ Product added successfully!");
      setName("");
      setPrice("");
      setImages([]);
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 450, margin: "40px auto" }}>
      <h2>Add Product</h2>
      <form style={{ display: "flex", flexDirection: "column", gap: "12px" }} onSubmit={handleSubmit}>
        <input type="text" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required />
        <input type="file" accept="image/*" multiple onChange={handleFileChange} />

        {images.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {images.map((img, idx) => (
              <img key={idx} src={URL.createObjectURL(img)} alt={`preview-${idx}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
            ))}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}