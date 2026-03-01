import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct";

export default function App() {
  return (
    <Router>
      <div>
        {/* Simple Navbar */}
        <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
          <Link to="/" style={{ marginRight: "15px" }}>Home</Link>
          <Link to="/add-product">Add Product</Link>
        </nav>

        {/* Page Content */}
        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-product" element={<AddProduct />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}