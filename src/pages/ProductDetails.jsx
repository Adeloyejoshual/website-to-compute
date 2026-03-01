import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setProduct(data))
  }, [id])

  const payWithPaystack = () => {
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: "customer@email.com",
      amount: product.price * 100,
      currency: "NGN",
      callback: function () {
        alert("Payment successful")
      },
    })
    handler.openIframe()
  }

  if (!product) return <p>Loading...</p>

  return (
    <div>
      <h2>{product.name}</h2>
      <p>₦{product.price}</p>
      <button onClick={payWithPaystack}>Buy Now</button>
    </div>
  )
}