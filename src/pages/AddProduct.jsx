import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function AddProduct() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return alert("Please login first")
      setUser(user)
    }
    fetchUser()
  }, [])

  const addProduct = async () => {
    if (!user) return
    if (!name || !price) return alert("Name and price required")

    const { error } = await supabase.from("products").insert([
      {
        name,
        price,
        description,
        seller_id: user.id, // FK references public.users.auth_id
        marketplace_type: "africa",
      },
    ])

    if (error) alert("Error adding product: " + error.message)
    else alert("Product added successfully")
  }

  return (
    <div style={{ maxWidth: 500, margin: "50px auto" }}>
      <h2>Add Product</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" />
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <button onClick={addProduct}>Add Product</button>
    </div>
  )
}