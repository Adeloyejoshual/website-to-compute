import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function AddProduct() {
  const [userId, setUserId] = useState(null); // seller_id from logged-in user
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Get current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  // Cloudinary upload
  const uploadImage = async () => {
    if (!image) return null;

    const formData = new FormData();
    formData.append("file", image);
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
    if (!userId) {
      setMessage("❌ Please log in first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 1️⃣ Insert product with seller_id
      const { data: product, error } = await supabase
        .from("products")
        .insert([
          {
            name,
            price: Number(price),
            seller_id: userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 2️⃣ Upload image to Cloudinary
      const imageUrl = await uploadImage();

      // 3️⃣ Save image in product_images table
      if (imageUrl) {
        const { error: imgError } = await supabase
          .from("product_images")
          .insert([
            {
              product_id: product.id,
              image_url: imageUrl,
              is_primary: true,
              position: 1,
            },
          ]);
        if (imgError) throw imgError;
      }

      setMessage("✅ Product added successfully!");
      setName("");
      setPrice("");
      setImage(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Add Product</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="preview"
            style={{ width: "100%", borderRadius: 8 }}
          />
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}