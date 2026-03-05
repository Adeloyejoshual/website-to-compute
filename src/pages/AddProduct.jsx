import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function AddProduct() {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  // Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      const loggedUser = data?.user

      if (!loggedUser) {
        alert("Please login first")
        return
      }

      setUser(loggedUser)

      // Ensure user exists in public.users table
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", loggedUser.id)
        .single()

      if (!dbUser) {
        // Insert user if not exists
        const { error } = await supabase.from("users").insert([
          {
            auth_id: loggedUser.id,
            email: loggedUser.email,
            full_name: loggedUser.user_metadata?.full_name || "",
            phone: loggedUser.user_metadata?.phone || "",
            is_seller: true
          }
        ])
        if (error) console.log("Error inserting user:", error)
      }
    }

    fetchUser()
  }, [])

  const addProduct = async () => {
    if (!user) return
    if (!name || !price) {
      alert("Product name and price are required")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("products").insert([
      {
        name,
        description,
        price,
        seller_id: user.id,       // Must match users.auth_id
        marketplace_type: "africa" // or "global" depending on your marketplace
      }
    ])

    if (error) {
      alert("Error adding product: " + error.message)
      console.log(error)
    } else {
      alert("Product added successfully")
      setName("")
      setPrice("")
      setDescription("")
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 500, margin: "50px auto" }}>
      <h2>Add Product</h2>

      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <button
        onClick={addProduct}
        disabled={loading}
        style={{ width: "100%", padding: 12 }}
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </div>
  )
}