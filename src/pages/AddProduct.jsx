// src/pages/AddProduct.jsx
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

  useEffect(() => { if (session?.user?.id) setUserId(session.user.id); }, [session]);
  const handleFileChange = (e) => setImages(Array.from(e.target.files));

  const uploadImage = async (file, productId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", `chatImages/${productId}`);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || !data.secure_url) throw new Error(data.error?.message || "Upload failed");
    return { image_url: data.secure_url, public_id: data.public_id };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !title.trim() || !price || images.length === 0) return setMessage("❌ Fill all fields");

    setLoading(true); setMessage("");

    try {
      // Create product first
      const { data: product, error: productError } = await supabase
        .from("products").insert([{ title, price: Number(price), seller_id: userId, stock: 1 }]).select().single();
      if (productError) throw productError;

      const imageRecords = [];
      for (let i = 0; i < images.length; i++) {
        const result = await uploadImage(images[i], product.id);
        imageRecords.push({ product_id: product.id, seller_id: userId, image_url: result.image_url, public_id: result.public_id, is_primary: i===0, position: i+1 });
      }

      const { error: imgError } = await supabase.from("product_images").insert(imageRecords);
      if (imgError) throw imgError;

      setMessage(`✅ "${title}" added with ${images.length} images!`);
      setTitle(""); setPrice(""); setImages([]);
      document.querySelector('input[type="file"]').value = "";
    } catch (err) { setMessage("❌ " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 500, margin: 40, padding: 24, borderRadius: 12, background: "#fff" }}>
      <h2>Add New Product</h2>
      {message && <div style={{ marginBottom: 20, padding: 12, background: message.includes("✅") ? "#dcfce7" : "#fee2e2", borderRadius: 8, borderLeft: `4px solid ${message.includes("✅") ? "#10b981" : "#ef4444"}` }}>{message}</div>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input type="text" placeholder="Product Title *" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: 14, border: "1px solid #d1d5db", borderRadius: 8 }} />
        <input type="number" min="0" step="0.01" placeholder="Price (₦) *" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: 14, border: "1px solid #d1d5db", borderRadius: 8 }} />
        <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ padding: 14, border: "2px dashed #d1d5db", borderRadius: 8 }} />
        {images.length>0 && <div style={{ display:"flex", gap:12, flexWrap:"wrap", padding:16, background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0" }}>{images.map((img,i)=><img key={i} src={URL.createObjectURL(img)} alt={`Preview ${i+1}`} style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:"2px solid #3b82f6"}} />)}<span style={{alignSelf:"center",color:"#6b7280"}}>{images.length} image(s)</span></div>}
        <button type="submit" disabled={loading || !userId || images.length===0} style={{ padding:16, background:"#10b981", color:"white", border:"none", borderRadius:8, fontSize:16, cursor:"pointer" }}>{loading?"⏳ Adding...":`➕ Add Product + ${images.length} Images`}</button>
      </form>
    </div>
  );
}