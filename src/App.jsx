// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Settings from "./pages/Settings"; // ✅ New
import Navbar from "./components/Navbar";

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Navbar session={session} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/add"
          element={session ? <AddProduct session={session} /> : <Login />}
        />
        <Route
          path="/settings"
          element={session ? <Settings session={session} /> : <Login />} // ✅ Protected route
        />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}