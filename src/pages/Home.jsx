// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price, brand, model, created_at, is_public")
      .order("created_at", { ascending: false })
      .eq("is_public", true);

    if (error) {
      console.error("Error fetching products:", error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marketplace Products</h1>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="h-48 bg-gray-100 rounded-md mb-4 flex items-center justify-center text-gray-400">
                {/* Placeholder image */}
                No Image
              </div>
              <h2 className="font-semibold text-lg mb-1">{product.name}</h2>
              {product.brand && <p className="text-gray-500 text-sm">{product.brand}</p>}
              {product.model && <p className="text-gray-500 text-sm">{product.model}</p>}
              <p className="text-gray-700 mt-2">{product.description}</p>
              <p className="mt-2 font-bold">₦{product.price}</p>
              <p className="text-gray-400 text-xs mt-1">
                Posted on {new Date(product.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;