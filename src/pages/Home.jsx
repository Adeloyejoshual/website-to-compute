// src/pages/HomePage.jsx - ✅ PRODUCTION-READY with your new schema
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // ✅ Debounced search + loading states
  useEffect(() => {
    loadData();
  }, []);

  // ✅ Optimized search filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = products.filter((p) =>
        (p.title || "").toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, products]);

  async function loadData() {
    setLoading(true);

    // Load products
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id,title,price,seller_id")
      .eq("marketplace_type", "marketplace")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(24); // ✅ Performance limit

    if (productsError) {
      console.error("Products error:", productsError);
      setLoading(false);
      return;
    }

    // ✅ FIXED: Select public_id too (matches your new AddProduct)
    const { data: imagesData, error: imagesError } = await supabase
      .from("product_images")
      .select("id,product_id,image_url,public_id,is_primary")
      .eq("is_primary", true);

    if (imagesError) {
      console.error("Images error:", imagesError);
    }

    setProducts(productsData || []);
    setImages(imagesData || []);
    setFilteredProducts(productsData || []);
    setLoading(false);
  }

  // ✅ Memoized image lookup
  const getImage = useCallback((productId) => {
    const img = images.find((i) => i.product_id === productId && i.is_primary);
    return img?.image_url;
  }, [images]);

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
        <div style={{ textAlign: "center", padding: "60px" }}>
          <div style={{
            width: 48, height: 48, border: "4px solid #f3f4f6",
            borderTop: "4px solid #3b82f6", borderRadius: "50%",
            animation: "spin 1s linear infinite", margin: "0 auto 20px"
          }} />
          <p style={{ color: "#6b7280" }}>Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ 
          fontSize: "2.5rem", 
          background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: 0 
        }}>
          Marketplace
        </h1>
        <p style={{ color: "#6b7280", marginTop: 4 }}>
          {filteredProducts.length} products found
        </p>
      </div>

      <input
        type="text"
        placeholder={`Search ${products.length} products...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 500,
          padding: "14px 20px",
          marginBottom: "32px",
          border: "2px solid #e5e7eb",
          borderRadius: "12px",
          fontSize: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "all 0.2s"
        }}
        onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
      />

      {filteredProducts.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "80px 20px", 
          color: "#6b7280" 
        }}>
          <div style={{ 
            fontSize: "4rem", 
            marginBottom: 20 
          }}>📦</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#374151" }}>
            {search ? "No matching products" : "No products yet"}
          </h3>
          <p style={{ margin: 0 }}>
            {search 
              ? `Try searching for "${search}"` 
              : "Be the first to list something!"
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
          gap: "24px"
        }}>
          {filteredProducts.map((product) => {
            const imageUrl = getImage(product.id);

            return (
              <div
                key={product.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "16px",
                  padding: 0,
                  background: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}
              >
                <div style={{ position: "relative", height: "180px" }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                      fontSize: "14px"
                    }}>
                      <div style={{ fontSize: "2rem", marginBottom: 4 }}>📦</div>
                      No Image
                    </div>
                  )}
                </div>

                <div style={{ padding: "20px" }}>
                  <h3 style={{
                    margin: "0 0 12px 0",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    lineHeight: "1.4",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    color: "#1f2937"
                  }}>
                    {product.title || "Untitled Product"}
                  </h3>

                  <p style={{
                    margin: 0,
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "#059669"
                  }}>
                    ₦{Number(product.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}