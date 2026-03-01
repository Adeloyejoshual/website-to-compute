import React, { useState } from "react";
import { supabase } from "../config/supabaseClient";
import axios from "axios";
import { categoryFields } from "../config/categoryFields";

export default function AddProduct({ categories, sellers, refreshProducts }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    seller_id: "",
    category_id: "",
    is_public: true,
  });
  const [dynamicFields, setDynamicFields] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle category change
  const handleCategoryChange = (catId, catName) => {
    setFormData({ ...formData, category_id: catId });
    const fields = categoryFields[catName] || [];
    const newDynamic = {};
    fields.forEach((f) => (newDynamic[f] = ""));
    setDynamicFields(newDynamic);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDynamicChange = (e) => {
    const { name, value } = e.target;
    setDynamicFields({ ...dynamicFields, [name]: value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const form = new FormData();
    form.append("file", imageFile);
    form.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const res = await axios.post(import.meta.env.VITE_CLOUDINARY_URL, form);
    return res.data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let image_url = null;
    if (imageFile) {
      image_url = await uploadImage();
    }

    const { data, error } = await supabase
      .from("products")
      .insert([{ ...formData, ...dynamicFields }]);

    if (error) {
      console.error(error);
      alert("Failed to add product.");
    } else {
      if (image_url) {
        await supabase.from("product_images").insert([
          { product_id: data[0].id, image_url, is_primary: true },
        ]);
      }
      alert("Product added!");
      setFormData({
        name: "",
        description: "",
        price: "",
        seller_id: "",
        category_id: "",
        is_public: true,
      });
      setDynamicFields({});
      setImageFile(null);
      if (refreshProducts) refreshProducts();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Product</h2>

      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />

      <select
        name="seller_id"
        value={formData.seller_id}
        onChange={handleChange}
        required
      >
        <option value="">Select Seller</option>
        {sellers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.seller_type})
          </option>
        ))}
      </select>

      <select
        name="category_id"
        value={formData.category_id}
        onChange={(e) => {
          const selected = categories.find((c) => c.id == e.target.value);
          handleCategoryChange(selected.id, selected.name);
        }}
        required
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Dynamic Fields */}
      {Object.keys(dynamicFields).map((field) => (
        <input
          key={field}
          type="text"
          name={field}
          placeholder={field.replace("_", " ")}
          value={dynamicFields[field]}
          onChange={handleDynamicChange}
        />
      ))}

      <input type="file" onChange={handleImageChange} />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}