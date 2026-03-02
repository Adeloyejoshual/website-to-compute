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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Navbar session={session} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddProduct session={session} />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}