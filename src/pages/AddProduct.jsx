// src/pages/AddProduct.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AddProduct() {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
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

  // Convert file to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  // Handle file input
  const handleFileChange = (e) => setImages(Array.from(e.target.files));

  // Upload a single image to server
  const uploadImage = async (file) => {
    const base64 = await toBase64(file);
    const res = await fetch("http://localhost:5000/api/uploadImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64 }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.url;
  };

  // Submit product
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

      // 2️⃣ Upload images if any
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

        {/* Preview selected images */}
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

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}