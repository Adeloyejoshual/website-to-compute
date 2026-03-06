// src/pages/Login.jsx - PRODUCTION READY
import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegister, setIsRegister] = useState(false)

  const navigate = useNavigate()

  // ✅ Form validation
  const validate = () => {
    if (!email || !password) return "Enter email and password"
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) return "Enter a valid email"
    if (password.length < 6) return "Password must be at least 6 characters"
    if (isRegister && (!fullName.trim() || !phone.trim())) return "Full name and phone required"
    if (isRegister && !/^[0-9]{7,15}$/.test(phone)) return "Enter a valid phone number (7-15 digits)"
    return null
  }

  // ✅ Clear form
  const clearForm = () => {
    setFullName("")
    setPhone("")
    setEmail("")
    setPassword("")
    setError("")
  }

  // ✅ Register user
  const register = async () => {
    const err = validate()
    if (err) return setError(err)

    setLoading(true)
    setError("")

    // Sign up with Supabase Auth
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

    // ✅ Auto-create row in your users table
    if (data?.user) {
      const { error: dbError } = await supabase.from("users").insert([{
        auth_id: data.user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        is_seller: false,
        seller_type: "public",
        marketplace_type: "buyer",
        is_active: true,
        kyc_status: "pending"
      }])

      if (dbError) {
        console.error(dbError)
        setError("Failed to save profile in users table")
      } else {
        alert("✅ Account created! Check your email to confirm.")
        setIsRegister(false)
        clearForm()
      }
    }

    setLoading(false)
  }

  // ✅ Login user
  const login = async () => {
    const err = validate()
    if (err) return setError(err)

    setLoading(true)
    setError("")

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim()
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      clearForm()
      navigate("/") // Redirect to homepage after login
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    clearForm()
  }

  // ✅ Handle input changes and clear errors on type
  const handleChange = (setter) => (e) => {
    setter(e.target.value)
    setError("")
  }

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>{isRegister ? "Create Account" : "Welcome Back"}</h2>

      {error && <div style={errorStyle}>{error}</div>}

      {isRegister && (
        <>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={handleChange(setFullName)}
            style={inputStyle}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={handleChange(setPhone)}
            style={inputStyle}
          />
        </>
      )}

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={handleChange(setEmail)}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={handleChange(setPassword)}
        style={inputStyle}
      />

      <button
        onClick={isRegister ? register : login}
        disabled={loading}
        style={{
          ...buttonStyle,
          background: isRegister ? "#10b981" : "#3b82f6",
          color: "white",
          marginBottom: 12
        }}
      >
        {loading ? (isRegister ? "Creating..." : "Signing In...") : (isRegister ? "Register" : "Login")}
      </button>

      <button
        onClick={toggleMode}
        disabled={loading}
        style={{ ...buttonStyle, background: "#f3f4f6", color: "#374151" }}
      >
        {isRegister ? "Already have account? Login" : "New here? Create Account"}
      </button>
    </div>
  )
}

const containerStyle = {
  maxWidth: 420,
  margin: "60px auto",
  padding: "30px",
  border: "1px solid #e0e0e0",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
}

const headerStyle = {
  textAlign: "center",
  marginBottom: 24,
  color: "#333",
  fontSize: 28
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: 16,
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 16,
  boxSizing: "border-box"
}

const buttonStyle = {
  width: "100%",
  padding: "14px 16px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s"
}

const errorStyle = {
  background: "#fee2e2",
  color: "#dc2626",
  padding: "12px",
  borderRadius: 8,
  marginBottom: 16,
  borderLeft: "4px solid #dc2626"
}