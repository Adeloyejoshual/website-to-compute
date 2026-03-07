import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [miniMartProducts, setMiniMartProducts] = useState([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loadingMini, setLoadingMini] = useState(true);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [flashCountdown, setFlashCountdown] = useState("04:23:15");

  // Flash sale banner countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setFlashCountdown("04:23:15"); // Replace with real countdown logic
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Fetch MiniMart products
  useEffect(() => {
    fetchMiniMart();
  }, []);

  // Fetch Marketplace products
  useEffect(() => {
    fetchMarketplace();
  }, []);

  const fetchMiniMart = async () => {
    setLoadingMini(true);
    try {
      const { data } = await supabase
        .from("products")
        .select("id, title, price, discount_price, flash_sale_end, images, category")
        .eq("type", "minimart")
        .eq("status", "active")
        .limit(16)
        .order("created_at", { ascending: false });
      setMiniMartProducts(data || []);
    } catch (error) {
      console.error("MiniMart error:", error);
    } finally {
      setLoadingMini(false);
    }
  };

  const fetchMarketplace = async () => {
    setLoadingMarket(true);
    try {
      const { data } = await supabase
        .from("products")
        .select("id, title, price, location, images, category")
        .eq("type", "marketplace")
        .eq("status", "active")
        .limit(16)
        .order("created_at", { ascending: false });
      setMarketplaceProducts(data || []);
    } catch (error) {
      console.error("Marketplace error:", error);
    } finally {
      setLoadingMarket(false);
    }
  };

  const filterProducts = (products) =>
    products.filter(
      (p) =>
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

  const filteredMiniMart = filterProducts(miniMartProducts);
  const filteredMarketplace = filterProducts(marketplaceProducts);

  const goToProduct = (id) => navigate(`/product/${id}`);

  return (
    <div className="homepage">
      {/* ===== FLASH SALE BANNER ===== */}
      <div className="flash-banner">
        <span>🔥</span>
        <span>48 Hours Flash Sale - Up to 70% OFF Everything!</span>
        <span>{flashCountdown}</span>
      </div>

      {/* ===== TOP NAVIGATION ===== */}
      <nav className="top-nav">
        <div className="nav-container">
          <button 
            className={`nav-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Deals
          </button>
          <button 
            className={`nav-tab ${activeTab === "electronics" ? "active" : ""}`}
            onClick={() => setActiveTab("electronics")}
          >
            Electronics
          </button>
          <button 
            className={`nav-tab ${activeTab === "vehicles" ? "active" : ""}`}
            onClick={() => setActiveTab("vehicles")}
          >
            Vehicles
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">🛒 MiniMart Marketplace</h1>
          <p className="hero-subtitle">
            {filteredMiniMart.length + filteredMarketplace.length} amazing deals near you
          </p>
          <div className="search-container">
            <input
              className="search-input"
              placeholder="🔍 Search phones, cars, laptops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* ===== MINIMART FLASH DEALS ===== */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">🔥 MiniMart Featured Deals</h2>
          <button className="see-all-btn">See All Deals →</button>
        </div>
        <div className="products-grid">
          {loadingMini ? (
            Array(8).fill(0).map((_, i) => <SkeletonCard key={`mini-${i}`} />)
          ) : filteredMiniMart.length === 0 ? (
            <EmptyState text="No flash deals found" onClear={() => setSearchTerm("")} />
          ) : (
            filteredMiniMart.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                type="minimart" 
                onView={() => goToProduct(product.id)}
              />
            ))
          )}
        </div>
      </section>

      {/* ===== MARKETPLACE LISTINGS ===== */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">🏪 Trending Marketplace Listings</h2>
          <button className="see-all-btn">Browse Marketplace →</button>
        </div>
        <div className="products-grid">
          {loadingMarket ? (
            Array(8).fill(0).map((_, i) => <SkeletonCard key={`market-${i}`} />)
          ) : filteredMarketplace.length === 0 ? (
            <EmptyState text="No listings found" onClear={() => setSearchTerm("")} />
          ) : (
            filteredMarketplace.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                type="marketplace" 
                onView={() => goToProduct(product.id)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

// ===== UNIVERSAL PRODUCT CARD =====
function ProductCard({ product, type, onView }) {
  const firstImage = product.images?.[0];
  const title = product.title?.length > 45 ? `${product.title.slice(0, 45)}...` : product.title;
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (type !== "minimart" || !product.flash_sale_end) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(product.flash_sale_end);
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [product.flash_sale_end, type]);

  const isUrgent = type === "minimart" && 
    product.flash_sale_end && new Date(product.flash_sale_end) - new Date() < 3600000;

  return (
    <div className={`product-card ${type}`} onClick={onView}>
      <div className="flash-badge">{type === "minimart" ? "🔥 FLASH" : "🏪"}</div>
      
      <div className="product-image">
        {firstImage ? (
          <img src={firstImage} alt={product.title} loading="lazy" />
        ) : (
          <div className="image-placeholder">
            {type === "minimart" ? "📦" : "🏪"}
          </div>
        )}
      </div>
      
      <div className="product-content">
        {type === "minimart" && product.discount_price && (
          <div className="price-discount">
            <span className="old-price">₦{Number(product.price).toLocaleString()}</span>
            <span className="new-price">
              ₦{Number(product.discount_price).toLocaleString()}
            </span>
          </div>
        )}
        
        <h3 className="product-title">{title}</h3>
        
        {type === "minimart" && product.flash_sale_end && (
          <div className={`countdown ${isUrgent ? "urgent" : ""}`}>
            ⏰ {timeLeft}
          </div>
        )}
        
        {type === "marketplace" && (
          <p className="product-location">📍 {product.location || "Nationwide"}</p>
        )}
        
        <button className="view-product-btn" onClick={(e) => {
          e.stopPropagation();
          onView();
        }}>
          👁️ View Product
        </button>
      </div>
    </div>
  );
}

// ===== UTILITY COMPONENTS =====
function SkeletonCard() {
  return (
    <div className="product-card skeleton">
      <div className="flash-badge skeleton"></div>
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line short"></div>
      </div>
    </div>
  );
}

function EmptyState({ text, onClear }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📦</div>
      <p>{text}</p>
      {onClear && (
        <button className="clear-search-btn" onClick={onClear}>
          Clear Search
        </button>
      )}
    </div>
  );
}