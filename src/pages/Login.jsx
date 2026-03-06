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
  const validateForm = () => {
    if (!email || !password) return "Enter email and password"
    if (isRegister && (!fullName.trim() || !phone.trim())) return "Fill all fields"

    // Email regex
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) return "Enter a valid email"

    // Phone validation (7-15 digits)
    if (isRegister && !/^[0-9]{7,15}$/.test(phone)) return "Enter valid phone number"

    if (password.length < 6) return "Password must be at least 6 characters"

    return null
  }

  // Clear form and error
  const clearForm = () => {
    setFullName("")
    setPhone("")
    setEmail("")
    setPassword("")
    setError("")
  }

  // REGISTER USER
  const register = async () => {
    const errMsg = validateForm()
    if (errMsg) return setError(errMsg)

    setLoading(true)
    setError("")

    // 1️⃣ Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 2️⃣ Insert into users table manually
    if (authData?.user?.id) {
      const { error: dbError } = await supabase
        .from("users")
        .insert([{
          auth_id: authData.user.id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          is_seller: false,
          seller_type: "public",
          marketplace_type: "africa",
          email: email.trim().toLowerCase(),
          is_active: true,
          kyc_status: "pending",
          created_at: new Date()
        }])

      if (dbError) {
        console.error("DB Insert Error:", dbError)
        setError("Registration failed: unable to save profile")
        setLoading(false)
        return
      }
    }

    setLoading(false)
    alert("✅ Account created! Check your email to confirm.")
    setIsRegister(false)
    clearForm()
  }

  // LOGIN USER
  const login = async () => {
    const errMsg = validateForm()
    if (errMsg) return setError(errMsg)

    setLoading(true)
    setError("")

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    })

    setLoading(false)
    if (authError) setError(authError.message)
    else clearForm()
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 30, border: "1px solid #e0e0e0", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>{isRegister ? "Register Account" : "Welcome Back"}</h2>

      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}

      {isRegister && <>
        <input placeholder="Full Name *" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
        <input placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
      </>}

      <input placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
      <input type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />

      <button onClick={isRegister ? register : login} disabled={loading} style={buttonStyle}>
        {loading ? "Loading..." : isRegister ? "Register" : "Login"}
      </button>

      <button onClick={() => setIsRegister(!isRegister)} disabled={loading} style={{ ...buttonStyle, background: "#f3f4f6", color: "#374151" }}>
        {isRegister ? "Already have an account? Login" : "New user? Register"}
      </button>
    </div>
  )
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

const buttonStyle = {
  width: "100%",
  padding: 14,
  marginBottom: 12,
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
  background: "#3b82f6",
  color: "white"
}