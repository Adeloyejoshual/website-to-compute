import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [miniMartProducts, setMiniMartProducts] = useState([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch MiniMart products
  useEffect(() => {
    const fetchMiniMart = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, discount_price")
        .eq("type", "minimart")
        .eq("status", "active")
        .limit(12);
      if (!error) setMiniMartProducts(data || []);
    };
    fetchMiniMart();
  }, []);

  // Fetch Marketplace products
  useEffect(() => {
    const fetchMarketplace = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, location")
        .eq("type", "marketplace")
        .eq("status", "active")
        .limit(12);
      if (!error) setMarketplaceProducts(data || []);
    };
    fetchMarketplace();
  }, []);

  // Simple filter
  const filteredMiniMart = miniMartProducts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredMarketplace = marketplaceProducts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>🛒 MiniMart Marketplace</h1>

      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1.5rem",
          fontSize: "1rem",
        }}
      />

      {/* MiniMart Section */}
      <h2>🔥 MiniMart Featured Deals</h2>
      {filteredMiniMart.length === 0 && <p>No deals found</p>}
      <div style={{ display: "grid", gap: "1rem" }}>
        {filteredMiniMart.map((p) => (
          <div
            key={p.id}
            style={{
              padding: "1rem",
              background: "#f1f1f1",
              borderRadius: 8,
            }}
          >
            <h3>{p.title}</h3>
            <p>
              ₦{p.price.toLocaleString()}{" "}
              {p.discount_price && (
                <span style={{ textDecoration: "line-through", color: "#999" }}>
                  ₦{p.discount_price.toLocaleString()}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Marketplace Section */}
      <h2 style={{ marginTop: "2rem" }}>🏪 Marketplace Trending</h2>
      {filteredMarketplace.length === 0 && <p>No listings found</p>}
      <div style={{ display: "grid", gap: "1rem" }}>
        {filteredMarketplace.map((p) => (
          <div
            key={p.id}
            style={{
              padding: "1rem",
              background: "#f9f9f9",
              borderRadius: 8,
            }}
          >
            <h3>{p.title}</h3>
            <p>📍 {p.location || "Nationwide"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}