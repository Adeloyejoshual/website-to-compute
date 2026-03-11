// pages/AddProduct.jsx
import { useState } from "react";
import axios from "axios";

export default function AddProduct() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category_id", categoryId);
    if (imageFile) formData.append("image", imageFile);

    try {
      const token = localStorage.getItem("token"); // JWT from login
      const res = await axios.post("/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Product added successfully!");
      setTitle(""); setDescription(""); setPrice(""); setImageFile(null);
    } catch (err) {
      console.error("Failed to add product", err);
      alert("Failed to add product");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="border p-2"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Category ID"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          required
          className="border p-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => setImageFile(e.target.files[0])}
          className="border p-2"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Add Product
        </button>
      </form>
    </div>
  );
}