// src/pages/AddProduct.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import crypto from "crypto"; // for generating signature

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

export default function AddProduct() {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  const handleFileChange = (e) => setImages(Array.from(e.target.files));

  // Generate Cloudinary signature
  const generateSignature = (paramsToSign) => {
    const query = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join("&");
    return crypto.createHmac("sha1", API_SECRET).update(query).digest("hex");
  };

  // Upload a single image
  const uploadImage = async (file) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = { timestamp };
    const signature = generateSignature(paramsToSign);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", API_KEY);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", "products");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "Upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return setMessage("❌ Please log in first.");
    if (!title || !price) return setMessage("❌ Title and Price required.");

    setLoading(true);
    setMessage("");

    try {
      // 1️⃣ Insert product
      const { data: product, error } = await supabase
        .from("products")
        .insert([{ title, price: Number(price), seller_id: userId }])
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
      setTitle("");
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
      <form style={{ display: "flex", flexDirection: "column", gap: 12 }} onSubmit={handleSubmit}>
        <input type="text" placeholder="Product Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input type="file" accept="image/*" multiple onChange={handleFileChange} />

        {images.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {images.map((img, idx) => (
              <img key={idx} src={URL.createObjectURL(img)} alt={`preview-${idx}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
            ))}
          </div>
        )}

        <button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Product"}</button>
      </form>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}