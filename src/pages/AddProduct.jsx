import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function AddProduct() {

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const addProduct = async () => {

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      alert("Please login first")
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
          seller_id: user.id,   // IMPORTANT
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
    <div style={{maxWidth:500, margin:"50px auto"}}>

      <h2>Add Product</h2>

      <input
        placeholder="Product name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e)=>setPrice(e.target.value)}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e)=>setDescription(e.target.value)}
      />

      <button onClick={addProduct} disabled={loading}>
        Add Product
      </button>

    </div>
  )
}