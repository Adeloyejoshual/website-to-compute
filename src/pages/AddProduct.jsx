import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// Cloudinary config from environment
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function AddProduct() {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // handle image selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  // upload single image to Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    console.log("Uploading file:", file.name);
    console.log("Cloud name:", CLOUD_NAME, "Preset:", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      console.log("Cloudinary response:", data);

      if (!res.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Image upload failed");
      }

      return data.secure_url;
    } catch (err) {
      console.error("Upload error:", err);
      throw new Error(err.message || "Image upload failed");
    }
  };

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage("❌ Please log in first");
      return;
    }

    if (!title || !price) {
      setMessage("❌ Title and Price are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 1️⃣ create product
      const { data: product, error } = await supabase
        .from("products")
        .insert([
          {
            title,
            price: Number(price),
            seller_id: userId,
            seller_type: "public",
            marketplace_type: "marketplace",
            status: "active",
            stock: 1,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 2️⃣ upload images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          try {
            const url = await uploadImage(images[i]);

            const { error: imageError } = await supabase
              .from("product_images")
              .insert([
                {
                  product_id: product.id,
                  seller_id: userId,
                  image_url: url,
                  is_primary: i === 0,
                  position: i + 1,
                },
              ]);

            if (imageError) throw imageError;
          } catch (imgErr) {
            console.error("Failed to upload one image:", imgErr);
            setMessage(`❌ Failed to upload image: ${images[i].name}`);
          }
        }
      }

      setMessage("✅ Product added successfully!");
      setTitle("");
      setPrice("");
      setImages([]);
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ " + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 450, margin: "40px auto" }}>
      <h2>Add Product</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
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

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />

        {images.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt="preview"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
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