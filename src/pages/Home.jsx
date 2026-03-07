import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "./Home.css"; // Add your styles here

export default function Home() {
  const [miniMartProducts, setMiniMartProducts] = useState([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // Fetch MiniMart products
  useEffect(() => {
    const fetchMiniMart = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, discount_price, flash_sale_end, product_images(image_url)")
        .eq("marketplace_type", "minimart")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) console.error(error);
      else setMiniMartProducts(data || []);
    };
    fetchMiniMart();
  }, []);

  // Fetch Marketplace products
  useEffect(() => {
    const fetchMarketplace = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, location, product_images(image_url)")
        .eq("marketplace_type", "marketplace")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) console.error(error);
      else setMarketplaceProducts(data || []);
    };
    fetchMarketplace();
  }, []);

  const filterProducts = (products) =>
    products.filter((p) =>
      p.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

  const filteredMiniMart = filterProducts(miniMartProducts);
  const filteredMarketplace = filterProducts(marketplaceProducts);

  return (
    <div className="home-container">
      {/* HERO */}
      <header className="hero-section">
        <h1>🛒 MiniMart Marketplace</h1>
        <p>{filteredMiniMart.length + filteredMarketplace.length} deals found</p>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {/* MiniMart Section */}
      <section>
        <h2>🔥 MiniMart Deals</h2>
        <div className="products-grid">
          {filteredMiniMart.length === 0 && <p>No MiniMart deals found.</p>}
          {filteredMiniMart.map((p) => (
            <MiniMartCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Marketplace Section */}
      <section>
        <h2>🏪 Marketplace Trending</h2>
        <div className="products-grid">
          {filteredMarketplace.length === 0 && <p>No marketplace listings found.</p>}
          {filteredMarketplace.map((p) => (
            <MarketplaceCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ===== MiniMart Card =====
function MiniMartCard({ product }) {
  const image = product.product_images?.[0]?.image_url;
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!product.flash_sale_end) return;
    const interval = setInterval(() => {
      const diff = new Date(product.flash_sale_end) - new Date();
      if (diff <= 0) {
        setTimeLeft("Sale Ended");
        clearInterval(interval);
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [product.flash_sale_end]);

  return (
    <div className="product-card hover-shadow">
      <img src={image || "/placeholder.png"} alt={product.name} className="product-image" />
      <h3>{product.name}</h3>
      <p>₦{Number(product.price).toLocaleString()}</p>
      {product.discount_price && <p className="discount">₦{Number(product.discount_price).toLocaleString()}</p>}
      {product.flash_sale_end && <p className="countdown">⏰ {timeLeft}</p>}
    </div>
  );
}

// ===== Marketplace Card =====
function MarketplaceCard({ product }) {
  const image = product.product_images?.[0]?.image_url;

  return (
    <div className="product-card hover-shadow">
      <img src={image || "/placeholder.png"} alt={product.name} className="product-image" />
      <h3>{product.name}</h3>
      <p>📍 {product.location || "Nationwide"}</p>
      <p>₦{Number(product.price).toLocaleString()}</p>
    </div>
  );
}