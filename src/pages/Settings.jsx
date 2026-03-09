// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const getImageUrl = (publicId, format="jpg") => `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}.${format}`;

export default function Settings({ session }) {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const userId = session.user.id;

  const fetchProducts = async () => {
    setLoading(true);

    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id,title,price")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });
    if (productsError) { console.error(productsError); setLoading(false); return; }

    const { data: imagesData, error: imagesError } = await supabase
      .from("product_images")
      .select("id,product_id,public_id,is_primary");
    if (imagesError) console.error(imagesError);

    setProducts(productsData || []);
    setImages(imagesData || []);
    setLoading(false);
  };

  useEffect(() => { if(userId) fetchProducts(); }, [userId]);

  const getImage = (productId) => images.find(i => i.product_id === productId && i.is_primary);

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const productImages = images.filter(i => i.product_id === productId);
      const publicIds = productImages.map(i => i.public_id);

      if(publicIds.length) {
        const res = await fetch("https://your-backend.com/delete-product-images", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({publicIds})
        });
        if(!res.ok) throw new Error("Failed to delete images from Cloudinary");
      }

      const { error: imgError } = await supabase.from("product_images").delete().eq("product_id", productId);
      if(imgError) throw imgError;

      const { error: productError } = await supabase.from("products").delete().eq("id", productId);
      if(productError) throw productError;

      setMessage("✅ Product deleted successfully!");
      fetchProducts();
    } catch(err) {
      console.error(err);
      setMessage("❌ Delete failed: "+err.message);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h2>My Products</h2>
      {message && <p style={{ marginBottom: 12 }}>{message}</p>}
      {loading ? <p>Loading your products...</p> :
        products.length === 0 ? <p>No products found.</p> :
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {products.map(product => {
            const image = getImage(product.id);
            return (
              <div key={product.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,border:"1px solid #ddd",borderRadius:6}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  {image ? <img src={getImageUrl(image.public_id)} alt={product.title || "Untitled"} style={{width:80,height:80,objectFit:"cover",borderRadius:6}}/>
                    : <div style={{width:80,height:80,background:"#f3f3f3",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,fontSize:12,color:"#999"}}>No Image</div>}
                  <div>
                    <strong>{product.title || "Untitled Product"}</strong>
                    <p>₦{Number(product.price).toLocaleString()}</p>
                  </div>
                </div>
                <button style={{background:"#ff4d4f",color:"#fff",border:"none",padding:"6px 12px",borderRadius:4,cursor:"pointer"}} onClick={()=>handleDelete(product.id)}>Delete</button>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}