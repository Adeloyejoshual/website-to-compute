import React from "react";

export default function Products({ products }) {
  if (!products.length) {
    return <p>No products yet.</p>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ margin: "0 0 0.5rem 0" }}>{product.name}</h2>
          {product.description && <p style={{ margin: "0 0 0.5rem 0", color: "#555" }}>{product.description}</p>}
          <p style={{ fontWeight: "bold", margin: 0 }}>₦{Number(product.price).toLocaleString()}</p>
          <small style={{ color: "#888" }}>
            Added: {new Date(product.created_at).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}