// src/pages/Login.jsx
import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegister, setIsRegister] = useState(false)

  // Form validation
  const validate = () => {
    if (!email || !password) return "Enter email and password"
    if (isRegister && (!fullName.trim() || !phone.trim())) return "Fill all fields"
    
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) return "Invalid email"
    
    if (isRegister && !/^[0-9]{7,15}$/.test(phone)) return "Enter valid phone number"
    
    if (password.length < 6) return "Password must be at least 6 characters"
    
    return null
  }

  // Clear form
  const clearForm = () => {
    setFullName("")
    setPhone("")
    setEmail("")
    setPassword("")
    setError("")
  }

  // Registration
  const register = async () => {
    const err = validate()
    if (err) {
      setError(err)
      return
    }

    setLoading(true)
    setError("")

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim()
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Insert into users table manually
    if (data?.user) {
      const { error: dbError } = await supabase
        .from("users")
        .insert([{
          auth_id: data.user.id,
          email: email.trim().toLowerCase(),
          full_name: fullName.trim(),
          phone: phone.trim(),
          is_seller: false,
          seller_type: "public",
          marketplace_type: "buyer",
          is_active: true,
          kyc_status: "pending",
          created_at: new Date()
        }])

      if (dbError) {
        console.error(dbError)
        alert("Account created in Auth but failed to save profile!")
      } else {
        alert("✅ Account created! Check your email to confirm.")
      }
    }

    setIsRegister(false)
    setLoading(false)
    clearForm()
  }

  // Login
  const login = async () => {
    const err = validate()
    if (err) {
      setError(err)
      return
    }

    setLoading(true)
    setError("")

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim()
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      clearForm()
      // Redirect or update session in App.js
    }
  }

  // Toggle between login/register
  const toggleMode = () => {
    setIsRegister(!isRegister)
    clearForm()
  }

  const handleChange = (setter) => (e) => {
    setter(e.target.value)
    setError("")
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>{isRegister ? "Join Minimart" : "Welcome Back"}</h2>

      {error && <div style={errorStyle}>{error}</div>}

      {isRegister && (
        <>
          <input
            placeholder="Full Name *"
            value={fullName}
            onChange={handleChange(setFullName)}
            style={inputStyle}
          />
          <input
            placeholder="Phone Number *"
            value={phone}
            onChange={handleChange(setPhone)}
            style={inputStyle}
          />
        </>
      )}

      <input
        placeholder="Email Address *"
        value={email}
        onChange={handleChange(setEmail)}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Password *"
        value={password}
        onChange={handleChange(setPassword)}
        style={inputStyle}
      />

      <button
        onClick={isRegister ? register : login}
        disabled={loading}
        style={primaryButtonStyle(isRegister)}
      >
        {loading ? (isRegister ? "Creating Account..." : "Signing In...") : (isRegister ? "Register" : "Login")}
      </button>

      <button
        onClick={toggleMode}
        disabled={loading}
        style={secondaryButtonStyle}
      >
        {isRegister ? "Already have an account? Login" : "New? Create Account"}
      </button>
    </div>
  )
}

// Styles
const containerStyle = {
  maxWidth: 420,
  margin: "60px auto",
  padding: 30,
  border: "1px solid #e0e0e0",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
}

const titleStyle = {
  textAlign: "center",
  marginBottom: 24,
  color: "#333",
  fontSize: 28
}

const errorStyle = {
  background: "#fee2e2",
  color: "#dc2626",
  padding: 12,
  borderRadius: 8,
  marginBottom: 16,
  borderLeft: "4px solid #dc2626"
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
  fontWeight: 500,
  cursor: "pointer",
  marginBottom: 12,
  background: isRegister ? "#10b981" : "#3b82f6",
  color: "white"
})

const secondaryButtonStyle = {
  width: "100%",
  padding: 14,
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
  background: "#f3f4f6",
  color: "#374151"
}