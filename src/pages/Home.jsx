import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Home.css";

export default function Home() {
  const [miniMartProducts, setMiniMartProducts] = useState([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingMini, setLoadingMini] = useState(true);
  const [loadingMarket, setLoadingMarket] = useState(true);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Fetch MiniMart
  useEffect(() => {
    const fetchMiniMart = async () => {
      setLoadingMini(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, title, price, discount_price, flash_sale_end, images")
          .eq("status", "active")
          .eq("type", "minimart")
          .order("created_at", { ascending: false })
          .limit(12);
        if (error) throw error;
        setMiniMartProducts(data || []);
      } catch (err) {
        console.error("MiniMart fetch error:", err);
      } finally {
        setLoadingMini(false);
      }
    };
    fetchMiniMart();
  }, []);

  // Fetch Marketplace
  useEffect(() => {
    const fetchMarketplace = async () => {
      setLoadingMarket(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, title, price, location, images")
          .eq("status", "active")
          .eq("type", "marketplace")
          .order("created_at", { ascending: false })
          .limit(12);
        if (error) throw error;
        setMarketplaceProducts(data || []);
      } catch (err) {
        console.error("Marketplace fetch error:", err);
      } finally {
        setLoadingMarket(false);
      }
    };
    fetchMarketplace();
  }, []);

  // Filter products by search
  const filterProducts = (products) =>
    products.filter(
      (p) =>
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

  const filteredMiniMart = filterProducts(miniMartProducts);
  const filteredMarketplace = filterProducts(marketplaceProducts);

  return (
    <div className="home-container">
      {/* HERO */}
      <header className="hero-section">
        <h1 className="hero-title">🛒 MiniMart Marketplace</h1>
        <p className="hero-subtitle">
          {filteredMiniMart.length + filteredMarketplace.length} deals found
        </p>
        <input
          className="search-input"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </header>

      {/* MINI-MART */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">🔥 MiniMart Featured Deals</h2>
        </div>
        <div className="products-grid minimart-grid">
          {loadingMini
            ? Array(6)
                .fill(0)
                .map((_, i) => <SkeletonCard key={`mini-${i}`} />)
            : filteredMiniMart.length === 0
            ? <EmptyState text="No flash deals found" onClear={() => setSearchTerm("")} />
            : filteredMiniMart.map((p) => <MiniMartCard key={p.id} product={p} />)
          }
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">🏪 Marketplace Trending</h2>
        </div>
        <div className="products-grid marketplace-grid">
          {loadingMarket
            ? Array(6)
                .fill(0)
                .map((_, i) => <SkeletonCard key={`market-${i}`} />)
            : filteredMarketplace.length === 0
            ? <EmptyState text="No marketplace listings found" onClear={() => setSearchTerm("")} />
            : filteredMarketplace.map((p) => <MarketplaceCard key={p.id} product={p} />)
          }
        </div>
      </section>
    </div>
  );
}

// ===== MiniMart Card =====
function MiniMartCard({ product }) {
  const firstImage = product.images?.[0];
  const [timeLeft, setTimeLeft] = useState("");
  const title = product.title.length > 45 ? product.title.slice(0, 45) + "..." : product.title;

  useEffect(() => {
    if (!product.flash_sale_end) return;
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(product.flash_sale_end);
      const diff = end - now;
      if (diff <= 0) return setTimeLeft("Sale Ended");
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };
    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [product.flash_sale_end]);

  return (
    <div className="product-card minimart-card">
      <div className="product-image">
        {firstImage ? <img src={firstImage} alt={product.title} /> : <div className="image-placeholder">📦</div>}
      </div>
      <div className="product-content">
        <div className="product-price">
          <span className="current-price">₦{Number(product.price).toLocaleString()}</span>
          {product.discount_price && <span className="discount-price">₦{Number(product.discount_price).toLocaleString()}</span>}
        </div>
        <h3 className="product-title">{title}</h3>
        {product.flash_sale_end && <div className="countdown">⏰ {timeLeft}</div>}
        <span className="flash-badge">Flash Sale</span>
      </div>
    </div>
  );
}

// ===== Marketplace Card =====
function MarketplaceCard({ product }) {
  const firstImage = product.images?.[0];
  const title = product.title.length > 50 ? product.title.slice(0, 50) + "..." : product.title;

  return (
    <div className="product-card marketplace-card">
      <div className="product-image">
        {firstImage ? <img src={firstImage} alt={product.title} /> : <div className="image-placeholder">🏪</div>}
      </div>
      <div className="product-content">
        <h3 className="product-title">{title}</h3>
        <p className="product-location">📍 {product.location || "Nationwide"}</p>
      </div>
    </div>
  );
}

// ===== Skeleton Loader =====
function SkeletonCard() {
  return (
    <div className="product-card skeleton">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line medium"></div>
      </div>
    </div>
  );
}

// ===== Empty State =====
function EmptyState({ text, onClear }) {
  return (
    <div className="empty-state">
      <p>{text}</p>
      {onClear && <button onClick={onClear}>Clear Search</button>}
    </div>
  );
}