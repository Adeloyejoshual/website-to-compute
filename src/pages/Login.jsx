// src/pages/Login.jsx - Production-ready with automatic user profile creation
import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)

  const validate = () => {
    if (!email || !password) return "Enter email and password"
    if (isRegister && (!fullName.trim() || !phone.trim()))
      return "Fill all fields"

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) return "Valid email required"

    if (isRegister && !/^[0-9]{7,15}$/.test(phone))
      return "Enter valid phone number"

    if (password.length < 6) return "Password must be at least 6 characters"

    return null
  }

  const clearForm = () => {
    setFullName("")
    setPhone("")
    setEmail("")
    setPassword("")
    setError("")
  }

  const register = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    // 1️⃣ Sign up in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
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
      setLoading(false)
      setError(authError.message)
      return
    }

    // 2️⃣ Automatically create user row in users table
    if (authData?.user?.id) {
      const { error: dbError } = await supabase.from("users").insert([
        {
          auth_id: authData.user.id,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          is_seller: false,
          seller_type: "individual",
          marketplace_type: "buyer",
          is_active: true,
          kyc_status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])

      setLoading(false)

      if (dbError) {
        console.error(dbError)
        setError(
          "✅ Account created in Auth, but failed to save profile. Contact support."
        )
      } else {
        alert("✅ Success! Check your email to confirm.")
        setIsRegister(false)
        clearForm()
      }
    }
  }

  const login = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
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
    }
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>{isRegister ? "Join Marketplace" : "Welcome Back"}</h2>

      {error && <div style={errorStyle}>{error}</div>}

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
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      <button
        onClick={isRegister ? register : login}
        disabled={loading}
        style={buttonStylePrimary}
      >
        {loading
          ? isRegister
            ? "Creating Account..."
            : "Signing In..."
          : isRegister
          ? "Register"
          : "Login"}
      </button>

      <button
        onClick={() => setIsRegister(!isRegister)}
        disabled={loading}
        style={buttonStyleSecondary}
      >
        {isRegister ? "Already have an account? Login" : "New? Create Account"}
      </button>
    </div>
  )
}

// ─────────────────────────── Styles ───────────────────────────
const containerStyle = {
  maxWidth: 400,
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
  marginBottom: 12,
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 500,
  color: "white",
  background: "#3b82f6",
  cursor: "pointer"
}

const buttonStyleSecondary = {
  width: "100%",
  padding: "14px 16px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 500,
  background: "#f3f4f6",
  color: "#374151",
  cursor: "pointer"
}