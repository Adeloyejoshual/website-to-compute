import { Link } from "react-router-dom"

export default function ProductCard({ product }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 15, margin: 10 }}>
      {product.product_images?.[0] && (
        <img
          src={product.product_images[0].image_url}
          width={200}
        />
      )}
      <h3>{product.name}</h3>
      <p>₦{product.price}</p>
      <Link to={`/product/${product.id}`}>View Details</Link>
    </div>
  )
}