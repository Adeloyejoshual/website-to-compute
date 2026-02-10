import React from "react";

export default function Products({ products }) {
  if (!products.length) return <p>No products yet.</p>;

  return (
    <div>
      {products.map((p) => (
        <div key={p.id} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          <p>Price: ${p.price}</p>
        </div>
      ))}
    </div>
  );
}