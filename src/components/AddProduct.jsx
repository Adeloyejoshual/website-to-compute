// src/components/AddProduct.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { categoryFields } from "../config/categoryFields";
import { brands } from "../config/brands";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    seller_id: null,
    image: null,
  });

  const [dynamicFields, setDynamicFields] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [users, setUsers] = useState([]);

  // Fetch all verified sellers
  useEffect(() => {
    const fetchSellers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("is_seller", true);
      if (error) console.log(error);
      else setUsers(data);
    };
    fetchSellers();
  }, []);

  // Update dynamic fields when category changes
  useEffect(() => {
    if (formData.category) {
      setDynamicFields(categoryFields[formData.category] || []);
      setFormData(prev => ({ ...prev, brand: "" }));
    }
  }, [formData.category]);

  // Handle input changes
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) setFormData(prev => ({ ...prev, image: files[0] }));
    else setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Upload image to Cloudinary
  const uploadImage = async file => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
      { method: "POST", body: form }
    );
    const data = await res.json();
    return data.secure_url;
  };

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();

    let uploadedUrl = "";
    if (formData.image) {
      uploadedUrl = await uploadImage(formData.image);
      setImageUrl(uploadedUrl);
    }

    // Build product payload
    const payload = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category_id: formData.category,
      seller_id: formData.seller_id,
      brand: formData.brand,
      image_url: uploadedUrl,
      is_public: true,
      seller_type: "verified",
    };

    const { data, error } = await supabase.from("products").insert([payload]);

    if (error) console.log(error);
    else {
      alert("Product added successfully!");
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        brand: "",
        seller_id: null,
        image: null,
      });
      setImageUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Product Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Price:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Category:</label>
        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {Object.keys(categoryFields).map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {dynamicFields.includes("brand") && (
        <div>
          <label>Brand:</label>
          <select name="brand" value={formData.brand} onChange={handleChange} required>
            <option value="">Select Brand</option>
            {brands[formData.category]?.map(brand => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label>Seller:</label>
        <select
          name="seller_id"
          value={formData.seller_id || ""}
          onChange={handleChange}
          required
        >
          <option value="">Select Seller</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.seller_type})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Upload Product Image:</label>
        <input type="file" name="image" onChange={handleChange} />
        {imageUrl && (
          <img src={imageUrl} alt="preview" className="w-32 mt-2 border" />
        )}
      </div>

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white">
        Add Product
      </button>
    </form>
  );
};

export default AddProduct;