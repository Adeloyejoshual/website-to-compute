import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import ProductCard from "../components/ProductCard"
import SearchFilter from "../components/SearchFilter"

export default function Home() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select(`*, product_images(image_url)`)
    setProducts(data || [])
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <SearchFilter setSearch={setSearch} />
      {filtered.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}