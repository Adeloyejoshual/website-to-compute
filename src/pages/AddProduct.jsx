import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function AddProduct() {
const [userId, setUserId] = useState(null);
const [title, setTitle] = useState("");
const [price, setPrice] = useState("");
const [images, setImages] = useState([]);
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");

useEffect(() => {
const getUser = async () => {
const { data: { user } } = await supabase.auth.getUser();
if (user) setUserId(user.id);
};
getUser();
}, []);

const handleFileChange = (e) => {
setImages(Array.from(e.target.files));
};

const uploadImage = async (file) => {
const formData = new FormData();
formData.append("file", file);
formData.append("upload_preset", UPLOAD_PRESET);

console.log("Uploading:", file.name);  

const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {  
  method: "POST",  
  body: formData  
});  

const data = await res.json();  
console.log("Cloudinary response:", data);  

if (!res.ok || !data.secure_url) {  
  throw new Error(data.error?.message || "Image upload failed");  
}  
return data.secure_url;

};

const handleSubmit = async (e) => {
e.preventDefault();
if (!userId) return setMessage("❌ Please log in first");
if (!title || !price) return setMessage("❌ Title and Price required");

setLoading(true);  
setMessage("");  

try {  
  // 1️⃣ Create product  
  const { data: product, error } = await supabase  
    .from("products")  
    .insert([{  
      title,  
      price: Number(price),  
      seller_id: userId,  
      seller_type: "public",  
      marketplace_type: "marketplace",  
      status: "active",  
      stock: 1  
    }])  
    .select()  
    .single();  

  if (error) throw error;  
  if (!product?.id) throw new Error("Failed to get product ID");  

  // 2️⃣ Upload images and insert into product_images  
  for (let i = 0; i < images.length; i++) {  
    const url = await uploadImage(images[i]);  

    const { error: imgError } = await supabase.from("product_images").insert([{  
      product_id: product.id,       // use the returned product ID  
      seller_id: userId,  
      image_url: url,  
      is_primary: i === 0,          // first image is primary  
      position: i + 1  
    }]);  

    if (imgError) throw imgError;  
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
<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
<input type="text" placeholder="Product Title" value={title} onChange={e => setTitle(e.target.value)} required />
<input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required />
<input type="file" accept="image/*" multiple onChange={handleFileChange} />

{images.length > 0 && (  
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>  
        {images.map((img, i) => (  
          <img key={i} src={URL.createObjectURL(img)} alt="preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />  
        ))}  
      </div>  
    )}  

    <button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Product"}</button>  
  </form>  

  {message && <p style={{ marginTop: 10 }}>{message}</p>}  
</div>

);
}
