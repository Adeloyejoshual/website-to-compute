import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

export default function App() {
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [file, setFile] = useState(null)

  const [newProductName, setNewProductName] = useState("")
  const [newProductPrice, setNewProductPrice] = useState("")
  const [newProductDescription, setNewProductDescription] = useState("")
  const [selectedSellerId, setSelectedSellerId] = useState(null)

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("users").select("*")
      setUsers(data || [])
    }
    fetchUsers()
  }, [])

  // Fetch products
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*")
    setProducts(data || [])
  }

  // Add product + upload image
  const addProduct = async () => {
    if (!newProductName || !newProductPrice || !selectedSellerId) return

    try {
      // 1️⃣ Insert product
      const { data: productData, error } = await supabase
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

      if (error) throw error

      const productId = productData[0].id
      let uploadedImageUrl = null

      // 2️⃣ Upload image if selected
      if (file) {
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

        const imgData = await res.json()
        uploadedImageUrl = imgData.secure_url

        // 3️⃣ Update product with primary image
        await supabase
          .from("products")
          .update({ primary_image_url: uploadedImageUrl })
          .eq("id", productId)
      }

      // Refresh product list
      await fetchProducts()

      // Reset form
      setNewProductName("")
      setNewProductPrice("")
      setNewProductDescription("")
      setSelectedSellerId(null)
      setFile(null)

    } catch (err) {
      console.error("Error adding product:", err)
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Marketplace Starter</h1>

      <h2>Users</h2>
      <pre>{JSON.stringify(users, null, 2)}</pre>

      <h2>Products</h2>
      {products.map((p) => (
        <div key={p.id} style={{ marginBottom: "1.5rem" }}>
          <strong>{p.name}</strong> - ₦{p.price}
          <p>{p.description}</p>

          {p.primary_image_url && (
            <img
              src={p.primary_image_url}
              alt={p.name}
              width={150}
              style={{ marginTop: "0.5rem" }}
            />
          )}

          <hr />
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
        <option value="" disabled>Select Seller</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.seller_type})
          </option>
        ))}
      </select>

      <div style={{ marginTop: "1rem" }}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <button
        onClick={addProduct}
        style={{ marginTop: "1rem" }}
      >
        Add Product
      </button>
    </div>
  )
}