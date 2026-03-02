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

  if (!session) {
    return <p style={{ padding: 20 }}>Please login to add product.</p>
  }

  const handleCategoryChange = (value) => {
    setCategory(value)

    const fields = categoryFields[value] || []
    const newFields = {}

    fields.forEach((field) => {
      newFields[field] = ""
    })

    setDynamicData(newFields)
  }

  const handleDynamicChange = (field, value) => {
    setDynamicData({
      ...dynamicData,
      [field]: value,
    })
  }

  const uploadToCloudinary = async () => {
    if (!file) return null

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

    if (!res.ok) throw new Error("Image upload failed")

    const data = await res.json()
    return data.secure_url
  }

  const handleSubmit = async () => {
    if (!name || !price || !category) {
      alert("Please fill all required fields")
      return
    }

    try {
      setLoading(true)

      // 1️⃣ Insert product
      const { data: productData, error } = await supabase
        .from("products")
        .insert([
          {
            name,
            price: parseFloat(price),
            description,
            category,
            seller_id: session.user.id,
            is_public: true,
            ...dynamicData,
          },
        ])
        .select()

      if (error) throw error

      const productId = productData[0].id

      // 2️⃣ Upload image
      if (file) {
        const imageUrl = await uploadToCloudinary()

        await supabase.from("product_images").insert([
          {
            product_id: productId,
            image_url: imageUrl,
            is_primary: true,
          },
        ])
      }

      alert("Product added successfully!")

      // Reset form
      setName("")
      setPrice("")
      setDescription("")
      setCategory("")
      setDynamicData({})
      setFile(null)
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 600 }}>
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
        placeholder="Price (₦)"
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
        {Object.keys(categoryFields).map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <br /><br />

      {/* Dynamic Fields */}
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
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Adding..." : "Add Product"}
      </button>
    </div>
  )
}