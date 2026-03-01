import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

export default function App() {
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)

  const [newProductName, setNewProductName] = useState("")
  const [newProductPrice, setNewProductPrice] = useState("")
  const [newProductDescription, setNewProductDescription] = useState("")
  const [selectedSellerId, setSelectedSellerId] = useState(null)

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*")
      if (error) setError(error.message)
      else setUsers(data)
    }
    fetchUsers()
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images:product_images(image_url, is_primary)
        `) // include linked images
      if (error) console.error("Products error:", error)
      else setProducts(data)
    }
    fetchProducts()
  }, [])

  // Upload image to Cloudinary and save in Supabase
  const uploadImageAndSave = async (productId) => {
    if (!file) return null

    const formData = new FormData()
    formData.append("file", file)
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    )

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
      { method: "POST", body: formData }
    )
    const data = await res.json()
    const imageUrl = data.secure_url

    // Save to product_images table
    const { error } = await supabase.from("product_images").insert([
      {
        product_id: productId,
        image_url: imageUrl,
        is_primary: true,
      },
    ])
    if (error) console.error("Error saving image:", error)

    return imageUrl
  }

  // Add product + upload image
  const addProductWithImage = async () => {
    if (!newProductName || !newProductPrice || !selectedSellerId) return

    try {
      // 1️⃣ Insert product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert([
          {
            name: newProductName,
            description: newProductDescription,
            price: parseFloat(newProductPrice),
            seller_id: selectedSellerId,
            is_public: true,
            seller_type: "verified",
            created_at: new Date(),
          },
        ])
        .select()

      if (productError) throw productError
      const productId = productData[0].id

      // 2️⃣ Upload image if file selected
      let uploadedImageUrl = null
      if (file) {
        uploadedImageUrl = await uploadImageAndSave(productId)
      }

      // 3️⃣ Update products state
      setProducts([
        ...products,
        {
          ...productData[0],
          product_images: uploadedImageUrl
            ? [{ image_url: uploadedImageUrl, is_primary: true }]
            : [],
        },
      ])

      // 4️⃣ Reset form
      setNewProductName("")
      setNewProductPrice("")
      setNewProductDescription("")
      setSelectedSellerId(null)
      setFile(null)
    } catch (err) {
      console.error("Add product error:", err)
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Marketplace Starter</h1>

      <h2>Users:</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <pre>{JSON.stringify(users, null, 2)}</pre>

      <h2>Products:</h2>
      {products.map((p) => (
        <div key={p.id} style={{ marginBottom: "1rem" }}>
          <strong>{p.name}</strong> - ${p.price} <br />
          {p.description} <br />
          Seller ID: {p.seller_id} <br />
          {p.product_images?.length > 0 && (
            <img
              src={p.product_images[0].image_url}
              alt={p.name}
              width={150}
              style={{ marginTop: "0.5rem" }}
            />
          )}
        </div>
      ))}

      <h2>Add New Product</h2>
      <input
        type="text"
        placeholder="Product Name"
        value={newProductName}
        onChange={(e) => setNewProductName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price"
        value={newProductPrice}
        onChange={(e) => setNewProductPrice(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description"
        value={newProductDescription}
        onChange={(e) => setNewProductDescription(e.target.value)}
      />
      <select
        value={selectedSellerId || ""}
        onChange={(e) => setSelectedSellerId(parseInt(e.target.value))}
      >
        <option value="" disabled>
          Select Seller
        </option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.seller_type})
          </option>
        ))}
      </select>

      <div>
        <h3>Upload Product Image</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      </div>

      <button onClick={addProductWithImage} style={{ marginTop: "1rem" }}>
        Add Product
      </button>
    </div>
  )
}