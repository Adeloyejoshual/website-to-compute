import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AddProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  const addProduct = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("products")
      .insert([
        {
          title: title,
          price: Number(price),
        },
      ]);

    if (error) {
      console.error(error);
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Product added");
      setTitle("");
      setPrice("");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Add Product (Test)</h2>

      <form onSubmit={addProduct} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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

        <button type="submit">Add Product</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}