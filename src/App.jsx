import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

import Home from "./pages/Home"
import AddProduct from "./pages/AddProduct"
import ProductDetails from "./pages/ProductDetails"
import Login from "./pages/Login"
import Navbar from "./components/Navbar"
import Dashboard from "./pages/Dashboard" // NEW - Create this next

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Auth listener + PROFILE SYNC
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        // ✅ SYNC users table on login
        if (event === 'SIGNED_IN' && session?.user) {
          const { error } = await supabase.from('users').upsert({
            auth_id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            phone: session.user.user_metadata?.phone || '',
            is_seller: false,
            seller_type: 'individual',
            marketplace_type: 'africa',
            is_active: true,
            kyc_status: 'pending',
            updated_at: new Date().toISOString()
          }, { onConflict: 'auth_id' })
          
          if (error) console.error('Profile sync failed:', error)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Loading screen
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Navbar session={session} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        
        {/* ✅ PROTECTED ROUTES */}
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard session={session} /> : <Navigate to="/login" />}
        />
        <Route 
          path="/add" 
          element={session ? <AddProduct session={session} /> : <Navigate to="/login" />}
        />
        
        <Route 
          path="/login" 
          element={session ? <Navigate to="/dashboard" /> : <Login />} 
        />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}