import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function AddProduct({ session }) {

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const addProduct = async () => {

    if (!session) {
      alert("Login first")
      return
    }

    if (!name || !price) {
      alert("Product name and price required")
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from("products")
      .insert([
        {
          name: name,
          description: description,
          price: price,
          seller_id: session.user.id,
          marketplace_type: "africa"
        }
      ])

    if (error) {
      alert(error.message)
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
        placeholder="Product name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        style={{ width:"100%", padding:10, marginBottom:10 }}
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e)=>setPrice(e.target.value)}
        style={{ width:"100%", padding:10, marginBottom:10 }}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e)=>setDescription(e.target.value)}
        style={{ width:"100%", padding:10, marginBottom:10 }}
      />

      <button
        onClick={addProduct}
        disabled={loading}
        style={{ width:"100%", padding:12 }}
      >
        Add Product
      </button>
    </div>
  )
}