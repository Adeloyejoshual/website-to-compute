// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          seller_id,
          seller_type,
          brand,
          image_url
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) console.log(error);
      else setProducts(data);

      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
      {products.length === 0 && <p>No products available yet.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(product => (
          <div
            key={product.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded"
              />
            )}
            <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
            {product.brand && <p className="text-sm">Brand: {product.brand}</p>}
            <p className="text-sm">{product.seller_type} Seller</p>
            <p className="text-blue-600 font-bold mt-1">₦{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;