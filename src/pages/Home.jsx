import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Load products
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id,title,price")
      .eq("marketplace_type", "marketplace")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (productsError) {
      console.log(productsError);
      return;
    }

    // Load images
    const { data: imagesData, error: imagesError } = await supabase
      .from("product_images")
      .select("product_id,image_url,is_primary");

    if (imagesError) {
      console.log(imagesError);
      return;
    }

    setProducts(productsData || []);
    setImages(imagesData || []);
  }

  function getImage(productId) {
    const img = images.find(
      (i) => i.product_id === productId && i.is_primary
    );
    return img?.image_url;
  }

  const filteredProducts = products.filter((p) =>
    (p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1>Marketplace</h1>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "6px",
          border: "1px solid #ccc"
        }}
      />

      {filteredProducts.length === 0 && <p>No products found.</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
          gap: "20px"
        }}
      >
        {filteredProducts.map((product) => {
          const image = getImage(product.id);

          return (
            <div
              key={product.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                background: "#fff"
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt={product.title}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "6px"
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "150px",
                    background: "#f3f3f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px"
                  }}
                >
                  No Image
                </div>
              )}

              <h3 style={{ marginTop: "10px" }}>
                {product.title || "Untitled Product"}
              </h3>

              <p>₦{Number(product.price).toLocaleString()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}