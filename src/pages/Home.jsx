import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase.js"

export default function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(image_url)")

      if (error) {
        console.error(error)
        return
      }

      setProducts(data || [])
    }

    fetchProducts()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Products</h2>

      {products.map((p) => (
        <div key={p.id} style={{ marginBottom: 20 }}>
          <strong>{p.name}</strong>
          <p>₦{p.price}</p>

          {p.product_images?.[0] && (
            <img
              src={p.product_images[0].image_url}
              width={150}
              alt={p.name}
            />
          )}
        </div>
      ))}
    </div>
  )
}