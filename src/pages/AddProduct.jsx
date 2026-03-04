import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function AddProduct() {
const [name, setName] = useState("")
const [price, setPrice] = useState("")
const [description, setDescription] = useState("")

const addProduct = async () => {
const {
data: { user },
} = await supabase.auth.getUser()

if (!user) {
  alert("You must login first")
  return
}

const { error } = await supabase.from("products").insert([
  {
    name: name,
    price: price,
    description: description,
    seller_id: user.id
  }
])

if (error) {
  alert("Error adding product")
  console.log(error)
} else {
  alert("Product added successfully")
  setName("")
  setPrice("")
  setDescription("")
}

}

return (
<div>
<h2>Add Product</h2>

  <input
    placeholder="Product name"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />

  <input
    placeholder="Price"
    type="number"
    value={price}
    onChange={(e) => setPrice(e.target.value)}
  />

  <textarea
    placeholder="Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />

  <button onClick={addProduct}>Add Product</button>
</div>

)
}