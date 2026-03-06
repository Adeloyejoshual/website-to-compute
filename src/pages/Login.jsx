// src/pages/Login.jsx
import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)

  const validate = () => {
    if (!email) return "Enter your email"
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) return "Enter a valid email"
    if (isRegister && (!fullName.trim() || !phone.trim())) return "Fill all fields"
    if (isRegister && !/^[0-9]{7,15}$/.test(phone)) return "Enter valid phone number"
    return null
  }

  // Magic link for register
  const handleRegister = async () => {
    const validationError = validate()
    if (validationError) return setError(validationError)

    setLoading(true)
    setError("")

    // send magic link
    const { error: magicError, data } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/login?type=magic`,
        data: {
          full_name: fullName.trim(),
          phone: phone.trim()
        }
      }
    })

    if (magicError) {
      setError(magicError.message)
    } else {
      alert("✅ Magic link sent! Check your email to complete registration.")
    }

    setLoading(false)
  }

  // Magic link for login
  const handleLogin = async () => {
    if (!email) return setError("Enter your email")
    setLoading(true)
    setError("")

    const { error: magicError } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/login?type=magic`
      }
    })

    if (magicError) {
      setError(magicError.message)
    } else {
      alert("✅ Magic link sent! Check your email to login.")
    }

    setLoading(false)
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    setError("")
    setFullName("")
    setPhone("")
    setEmail("")
  }

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>{isRegister ? "Join Marketplace" : "Welcome Back"}</h2>

      {error && <p style={errorStyle}>{error}</p>}

      {isRegister && (
        <>
          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />
        </>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      <button
        onClick={isRegister ? handleRegister : handleLogin}
        disabled={loading}
        style={buttonStylePrimary}
      >
        {loading
          ? "Sending Magic Link..."
          : isRegister
          ? "Register with Magic Link"
          : "Login with Magic Link"}
      </button>

      <button
        onClick={toggleMode}
        disabled={loading}
        style={buttonStyleSecondary}
      >
        {isRegister ? "Already have an account? Login" : "New? Register now"}
      </button>
    </div>
  )
}

// ---- Styles ----
const containerStyle = {
  maxWidth: 420,
  margin: "60px auto",
  padding: 30,
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
  padding: "14px 16px",
  marginBottom: 16,
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 16,
  boxSizing: "border-box"
}

const buttonStylePrimary = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
  background: "#3b82f6",
  color: "white",
  border: "none",
  marginBottom: 12
}

const buttonStyleSecondary = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
  background: "#f3f4f6",
  color: "#374151",
  border: "none"
}