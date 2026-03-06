import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Auth() {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegister, setIsRegister] = useState(false)

  const validateForm = () => {
    if (!email || !password) return "Enter email and password"
    if (isRegister && (!fullName.trim() || !phone.trim())) return "Fill all fields"
    if (!/^S+@S+.S+$/.test(email)) return "Valid email required"
    if (password.length < 6) return "Password minimum 6 characters"
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
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    const { error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim()
        }
      }
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      alert("✅ Success! Check your email to confirm.")
      setIsRegister(false)
      clearForm()
    }
  }

  const login = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      // Success - redirect handled by your app's auth listener
      clearForm()
      window.location.href = "/dashboard"
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    clearForm()
  }

  return (
    <div style={{
      maxWidth: 420,
      margin: "60px auto",
      padding: "30px",
      border: "1px solid #e0e0e0",
      borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
    }}>
      <h2 style={{ 
        textAlign: "center", 
        marginBottom: 24, 
        color: "#333",
        fontSize: 28
      }}>
        {isRegister ? "Join Minimart" : "Welcome Back"}
      </h2>

      {error && (
        <div style={{
          background: "#fee2e2",
          color: "#dc2626",
          padding: "12px",
          borderRadius: 8,
          marginBottom: 16,
          borderLeft: "4px solid #dc2626"
        }}>
          {error}
        </div>
      )}

      {isRegister && (
        <>
          <input
            type="text"
            placeholder="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
          />
          <input
            type="tel"
            placeholder="Phone Number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />
        </>
      )}

      <input
        type="email"
        placeholder="Email Address *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Password *"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      <button
        onClick={login}
        disabled={loading}
        style={{
          ...buttonStyle,
          background: isRegister ? "#f3f4f6" : "#3b82f6",
          color: isRegister ? "#374151" : "white",
          marginBottom: 12
        }}
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>

      <button
        onClick={register}
        disabled={loading}
        style={{
          ...buttonStyle,
          background: isRegister ? "#10b981" : "#f3f4f6",
          color: isRegister ? "white" : "#374151"
        }}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <div style={{
        textAlign: "center",
        marginTop: 24,
        paddingTop: 20,
        borderTop: "1px solid #e5e7eb",
        fontSize: 14
      }}>
        <span style={{ color: "#6b7280" }}>
          {isRegister ? "Already have an account?" : "New to Minimart?"}
        </span>
        <br />
        <button
          type="button"
          onClick={toggleMode}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            color: "#3b82f6",
            fontSize: 14,
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            textDecoration: "underline",
            padding: 0
          }}
        >
          {isRegister ? "Sign in instead" : "Create free account"}
        </button>
      </div>
    </div>
  )
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: 16,
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 16,
  boxSizing: "border-box",
  transition: "border-color 0.2s"
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