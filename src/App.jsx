import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

export default function App() {
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)
  const [imageUrl, setImageUrl] = useState("")
  const [newProductName, setNewProductName] = useState("")
  const [newProductPrice, setNewProductPrice] = useState("")
  const [newProductDescription, setNewProductDescription] = useState("")
  const [selectedSellerId, setSelectedSellerId] = useState(null)

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*")
      if (error) setError(error.message)
      else setUsers(data)
    }
    fetchUsers()
  }, [])

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*")
      if (error) console.error("Products error:", error)
      else setProducts(data)
    }
    fetchProducts()
  }, [])

  // Upload image to Cloudinary
  const uploadImage = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
      { method: "POST", body: formData }
    )

    const data = await res.json()
    setImageUrl(data.secure_url)
  }

  // Add new product
  const addProduct = async () => {
    if (!newProductName || !selectedSellerId || !newProductPrice) return
    const { data, error } = await supabase
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
    if (error) {
      console.error("Insert product error:", error)
    } else {
      setProducts([...products, ...data])
      setNewProductName("")
      setNewProductPrice("")
      setNewProductDescription("")
      setSelectedSellerId(null)
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Marketplace Starter</h1>

      <h2>Users:</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <pre>{JSON.stringify(users, null, 2)}</pre>

      <h2>Products:</h2>
      <pre>{JSON.stringify(products, null, 2)}</pre>

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

      <div>
        <h3>Upload Product Image</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={uploadImage}>Upload Image</button>
        {imageUrl && (
          <div>
            <p>Uploaded Image:</p>
            <img src={imageUrl} alt="Uploaded" width={200} />
          </div>
        )}
      </div>

      <button onClick={addProduct}>Add Product</button>
    </div>
  )
}