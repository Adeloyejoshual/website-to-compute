// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct"; // your add product page
import "./index.css"; // Tailwind CSS

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Marketplace
          </Link>
          <div className="space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link to="/add-product" className="text-gray-700 hover:text-blue-600">
              Add Product
            </Link>
          </div>
        </nav>

        {/* Main Routes */}
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-product" element={<AddProduct />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white shadow-inner p-4 text-center text-gray-500 mt-8">
          &copy; 2026 Marketplace. All rights reserved.
        </footer>
      </div>
    </Router>
  );
};

export default App;