// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

import Home from "./pages/Home"
import AddProduct from "./pages/AddProduct"
import ProductDetails from "./pages/ProductDetails"
import Login from "./pages/Login"
import Navbar from "./components/Navbar"

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      if (data.session?.user) {
        await ensureUserProfile(data.session.user)
      }
    }

    initSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          await ensureUserProfile(session.user)
        }
      }
    )

    return () => authListener.subscription.unsubscribe()
  }, [])

  // ✅ Ensure user row exists in `users` table
  const ensureUserProfile = async (user) => {
    if (!user) return
    try {
      // check if user already exists in `users` table
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", user.id)
        .single()

      if (!data) {
        // insert new row if not exists
        await supabase.from("users").insert([
          {
            auth_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            phone: user.user_metadata?.phone || null,
            is_seller: false,
            seller_type: "individual",
            marketplace_type: "buyer",
            is_active: true,
            kyc_status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            business_name: null,
            business_address: null
          }
        ])
      }
    } catch (err) {
      console.error("Error ensuring user profile:", err)
    }
  }

  return (
    <BrowserRouter>
      <Navbar session={session} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/add"
          element={session ? <AddProduct session={session} /> : <Login />}
        />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}