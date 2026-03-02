import { useState } from "react"
import { supabase } from "../lib/supabase.js"
import { categoryFields } from "../config/categoryFields.js"

export default function AddProduct({ session }) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [file, setFile] = useState(null)
  const [dynamicData, setDynamicData] = useState({})
  const [loading, setLoading] = useState(false)

  // ✅ If not logged in, do not crash
  if (!session) {
    return (
      <div style={{ padding: 20 }}>
        <h2>You must login to add a product</h2>
      </div>
    )
  }

  const handleCategoryChange = (value) => {
    setCategory(value)

    const fields = categoryFields?.[value] || {}
    const newFields = {}

    Object.keys(fields).forEach((field) => {
      newFields[field] = ""
    })

    setDynamicData(newFields)
  }

  const handleDynamicChange = (field, value) => {
    setDynamicData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const uploadToCloudinary = async () => {
    try {
      if (!file) return null

      if (
        !import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
        !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      ) {
        console.error("Cloudinary env missing")
        return null
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      )

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!res.ok) {
        console.error("Cloudinary upload failed")
        return null
      }

      const data = await res.json()
      return data.secure_url
    } catch (err) {
      console.error("Upload error:", err)
      return null
    }
  }

  const handleSubmit = async () => {
    if (!name || !price || !category) {
      alert("Please fill required fields")
      return
    }

    try {
      setLoading(true)

      const { data: productData, error } = await supabase
        .from("products")
        .insert([
          {
            name,
            price: parseFloat(price),
            description,
            category,
            seller_id: session?.user?.id || null,
            is_public: true,
            ...dynamicData,
          },
        ])
        .select()

      if (error) {
        console.error(error)
        alert("Product insert failed")
        return
      }

      const productId = productData?.[0]?.id

      if (productId && file) {
        const imageUrl = await uploadToCloudinary()

        if (imageUrl) {
          await supabase.from("product_images").insert([
            {
              product_id: productId,
              image_url: imageUrl,
              is_primary: true,
            },
          ])
        }
      }

      alert("Product added successfully!")

      // Reset form safely
      setName("")
      setPrice("")
      setDescription("")
      setCategory("")
      setDynamicData({})
      setFile(null)
    } catch (err) {
      console.error("Submit error:", err)
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>Add Product</h2>

      <input
        type="text"
        placeholder="Product Name"
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

      <select
        value={category}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="">Select Category</option>
        {Object.keys(categoryFields || {}).map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <br /><br />

      {Object.keys(dynamicData).map((field) => (
        <div key={field}>
          <input
            type="text"
            placeholder={field}
            value={dynamicData[field]}
            onChange={(e) =>
              handleDynamicChange(field, e.target.value)
            }
          />
          <br /><br />
        </div>
      ))}

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <br /><br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Adding..." : "Add Product"}
      </button>
    </div>
  )
}