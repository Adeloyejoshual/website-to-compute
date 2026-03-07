import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AddProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("minimart");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.from("products").insert([
        {
          title,
          price: Number(price),
          type,
          location,
          category,
          images: [image], // array for compatibility
          status: "active",
        },
      ]);

      if (error) throw error;

      setMessage("✅ Product added successfully");

      // reset form
      setTitle("");
      setPrice("");
      setLocation("");
      setCategory("");
      setImage("");
    } catch (error) {
      console.error(error);
      setMessage("❌ Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h2>Add Product (Test)</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        
        <input
          placeholder="Product title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="minimart">MiniMart</option>
          <option value="marketplace">Marketplace</option>
        </select>

        <input
          placeholder="Category (electronics, phones...)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          placeholder="Location (for marketplace)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>

      </form>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}