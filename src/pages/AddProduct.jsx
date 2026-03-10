// src/pages/AddProduct.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_FOLDER = "chatImages"; // Folder for your marketplace
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AddProduct({ session }) {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { if (session?.user?.id) setUserId(session.user.id); }, [session]);

  const handleFileChange = e => setImages(Array.from(e.target.files));

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", UPLOAD_FOLDER); // ✅ Upload to folder

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || !data.secure_url) throw new Error(data.error?.message || "Upload failed");

    // ✅ Store full folder path in public_id
    return {
      image_url: data.secure_url,
      public_id: data.public_id // e.g., chatImages/filename
    };
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!userId || !title || !price || images.length === 0) return;

    setLoading(true);
    setMessage("");
    const uploadedImages = [];

    try {
      // 1️⃣ Create product
      const { data: product, error: productError } = await supabase.from("products")
        .insert([{ title, price: Number(price), seller_id: userId, status: "active", stock: 1 }])
        .select().single();
      if (productError) throw productError;

      // 2️⃣ Upload images
      for (let i = 0; i < images.length; i++) {
        const result = await uploadImage(images[i]);
        uploadedImages.push(result);
      }

      // 3️⃣ Insert images into DB
      const imageRecords = uploadedImages.map((img, i) => ({
        product_id: product.id,
        seller_id: userId,
        image_url: img.image_url,
        public_id: img.public_id, // ✅ full folder path
        is_primary: i === 0,
        position: i + 1
      }));
      const { error: imgError } = await supabase.from("product_images").insert(imageRecords);
      if (imgError) throw imgError;

      setMessage(`✅ "${title}" added with ${images.length} images!`);
      setTitle(""); setPrice(""); setImages([]);

    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);

      // Rollback: delete uploaded images from Cloudinary
      const publicIds = uploadedImages.map(img => img.public_id);
      if (publicIds.length > 0) {
        await fetch(`${BACKEND_URL}/delete-product-images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicIds })
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
      <input type="file" multiple onChange={handleFileChange} />
      <button type="submit" disabled={loading}>Add Product</button>
      {message && <p>{message}</p>}
    </form>
  );
}