// src/pages/Login.jsx - Fixed for Minimart Marketplace + Trigger
import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isRegister, setIsRegister] = useState(false)

  const validate = () => {
    if (!email) return "Enter your email"
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) return "Invalid email"
    if (isRegister && (!fullName.trim() || !phone.trim())) 
      return "Fill all fields for registration"
    if (isRegister && !/^[0-9+ ]{10,15}$/.test(phone.replace(/s/g, ''))) 
      return "Enter valid phone (e.g. 08012345678)"
    return null
  }

  const clearForm = () => {
    setFullName("")
    setPhone("")
    setEmail("")
    setError("")
    setMessage("")
  }

  const registerOrMagicLogin = async () => {
    const err = validate()
    if (err) {
      setError(err)
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      if (isRegister) {
        // ✅ Register - TRIGGER handles users table insert
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          options: { 
            data: { 
              full_name: fullName.trim(), 
              phone: phone.trim() 
            },
            emailRedirectTo: window.location.origin
          }
        })

        if (authError) {
          setError(authError.message)
        } else if (data.user) {
          setMessage("✅ Account created! Check email to confirm & start selling.")
        } else {
          setMessage("✅ Check your email to confirm your account!")
        }
      } else {
        // ✅ Magic Link Login
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: { emailRedirectTo: window.location.origin }
        })

        if (authError) {
          setError(authError.message)
        } else {
          setMessage("✅ Magic link sent! Click to enter Minimart.")
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    }

    setLoading(false)
    clearForm()
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    clearForm()
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        {isRegister ? "👋 Join Minimart" : "🚀 Login to Marketplace"}
      </h2>

      {error && <div style={errorStyle}>{error}</div>}
      {message && <div style={messageStyle}>{message}</div>}

      {isRegister && (
        <>
          <input
            placeholder="Full Name *"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Phone (08012345678) *"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inputStyle}
          />
        </>
      )}

      <input
        placeholder="Email Address *"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={inputStyle}
      />

      <button
        onClick={registerOrMagicLogin}
        disabled={loading}
        style={primaryButtonStyle(isRegister)}
      >
        {loading ? "⏳ Processing..." : 
         isRegister ? "🎉 Create Account" : "✨ Send Magic Link"}
      </button>

      <button
        onClick={toggleMode}
        disabled={loading}
        style={secondaryButtonStyle}
      >
        {isRegister 
          ? "👤 Already have account? Login" 
          : "🆕 New Seller? Register Now"
        }
      </button>
    </div>
  )
}

// 🖌️ Styles (unchanged - perfect for mobile Nigeria users)
const containerStyle = {
  maxWidth: 420,
  margin: "60px auto",
  padding: 30,
  border: "1px solid #e0e0e0",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  background: "#fff"
}
const titleStyle = { 
  textAlign: "center", 
  marginBottom: 24, 
  color: "#1f2937", 
  fontSize: 28,
  fontWeight: 700
}
const errorStyle = { 
  background: "#fee2e2", 
  color: "#dc2626", 
  padding: 12, 
  borderRadius: 8, 
  marginBottom: 16, 
  borderLeft: "4px solid #dc2626" 
}
const messageStyle = { 
  background: "#d1fae5", 
  color: "#065f46", 
  padding: 12, 
  borderRadius: 8, 
  marginBottom: 16, 
  borderLeft: "4px solid #10b981" 
}
const inputStyle = { 
  width: "100%", 
  padding: 14, 
  marginBottom: 16, 
  border: "1px solid #d1d5db", 
  borderRadius: 8, 
  fontSize: 16, 
  boxSizing: "border-box" 
}
const primaryButtonStyle = (isRegister) => ({
  width: "100%", 
  padding: 14, 
  border: "none", 
  borderRadius: 8, 
  fontSize: 16, 
  fontWeight: 600, 
  cursor: "pointer", 
  marginBottom: 12, 
  background: isRegister ? "#10b981" : "#3b82f6", 
  color: "white",
  transition: "all 0.2s"
})
const secondaryButtonStyle = { 
  width: "100%", 
  padding: 14, 
  border: "1px solid #d1d5db", 
  borderRadius: 8, 
  fontSize: 16, 
  fontWeight: 500, 
  cursor: "pointer", 
  background: "#f9fafb", 
  color: "#374151",
  transition: "all 0.2s"
}