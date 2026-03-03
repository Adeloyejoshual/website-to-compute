import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AddProduct({ session }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!session) return <p>Please login to add a product.</p>;

  const handleSubmit = async () => {
    if (!name || !price) {
      alert("Please enter name and price");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.from("products").insert([
        {
          name,
          price: parseFloat(price),
          description,
          seller_id: session.user.id,
          is_public: true,
        },
      ]);
      if (error) throw error;

      alert("Product added!");
      setName("");
      setPrice("");
      setDescription("");
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h2>Add Product</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <br /><br />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br /><br />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Adding..." : "Add Product"}
      </button>
    </div>
  );
}