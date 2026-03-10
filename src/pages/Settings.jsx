import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Settings({ session }) {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState({});

  const userId = session?.user?.id;
  const fetchProducts = async () => {
    if (!userId) return;
    setLoading(true);
    const { data: productsData } = await supabase.from("products").select("id,title,price").eq("seller_id", userId).order("created_at",{ascending:false});
    const { data: imagesData } = await supabase.from("product_images").select("id,product_id,image_url,public_id,is_primary").eq("seller_id",userId);
    setProducts(productsData||[]); setImages(imagesData||[]); setLoading(false);
  };
  useEffect(()=>{if(userId) fetchProducts()},[userId]);

  const getImage = (productId)=>images.find(i=>i.product_id===productId&&i.is_primary)?.image_url;

  const handleDelete = async (productId) => {
    if (!confirm("Delete product and all images?")) return;
    setDeleting(prev=>({...prev,[productId]:true})); setMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/delete-product`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({productId}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Deletion failed");
      setMessage(data.message||"✅ Product deleted successfully");
      fetchProducts();
    } catch (err) { setMessage("❌ "+err.message); }
    finally { setDeleting(prev=>({...prev,[productId]:false})); }
  };

  return (
    <div style={{ maxWidth:900, margin:"40px auto", padding:20 }}>
      <h2>My Products</h2>
      {message&&<div style={{marginBottom:20,padding:12,background:message.includes("✅")?"#dcfce7":"#fee2e2",borderRadius:8,borderLeft:`4px solid ${message.includes("✅")?"#10b981":"#ef4444"}`}}>{message}</div>}
      {loading? <p>Loading...</p> : products.length===0?<p>No products. <a href="/add">Add product</a></p>: <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"20px"}}>
        {products.map(p=><div key={p.id} style={{border:"1px solid #e5e7eb",borderRadius:12,padding:16,background:"#fff"}}>
          {getImage(p.id)?<img src={getImage(p.id)} alt={p.title} style={{width:"100%",height:140,objectFit:"cover",borderRadius:8}}/>:<div style={{height:140,background:"#f3f3f3",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,color:"#999"}}>No Image</div>}
          <h3>{p.title}</h3>
          <p>₦{Number(p.price).toLocaleString()}</p>
          <button onClick={()=>handleDelete(p.id)} disabled={deleting[p.id]} style={{width:"100%",background:deleting[p.id]?"#6b7280":"#ef4444",color:"white",border:"none",padding:10,borderRadius:8,cursor:deleting[p.id]?"not-allowed":"pointer"}}>
            {deleting[p.id]?"⏳ Deleting...":"🗑️ Delete Product"}
          </button>
        </div>)}
      </div>}
    </div>
  );
}