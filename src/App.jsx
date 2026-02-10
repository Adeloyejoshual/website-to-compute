import React from "react";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";

export default function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>MiniMart</h1>
      <ProductForm />
      <hr style={{ margin: "20px 0" }} />
      <ProductList />
    </div>
  );
}