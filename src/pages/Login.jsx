import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState("")

  const validateForm = () => {
    if (!email || !password) return "Enter email and password"
    if (isRegister && (!fullName.trim() || !phone.trim())) return "Fill all fields for register"
    
    // ✅ CORRECTED regex - matches real emails
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

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            full_name: fullName.trim(), 
            phone: phone.trim()
          } 
        }
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (data?.user) {
        // Insert complete user profile matching YOUR schema
        const { error: dbError } = await supabase.from("users").insert([{
          auth_id: data.user.id,
          full_name: fullName.trim(),
          email: email.toLowerCase(),
          phone: phone.trim(),
          is_seller: false,
          seller_type: "individual",
          marketplace_type: "buyer",
          is_active: true,
          kyc_status: "pending"
          // Optional fields remain NULL/default: business_name, etc.
        }])

        if (dbError) {
          console.error("DB Error:", dbError)
          setError("Registration failed - contact support")
        } else {
          alert("✅ Registration successful! Check your email to confirm.")
          setIsRegister(false) // Switch to login
        }
      }
    } catch (err) {
      setError("Registration failed. Try again.")
    } finally {
      setLoading(false)
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

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase(),
        password 
      })
      
      if (authError) {
        setError(authError.message)
      } else {
        clearForm()
        // Redirect handled by your app's auth listener
        window.location.href = "/dashboard" // Or use useNavigate
      }
    } catch (err) {
      setError("Login failed. Check credentials.")
    } finally {
      setLoading(false)
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
      padding: "20px", 
      border: "1px solid #ddd", 
      borderRadius: 8,
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        {isRegister ? "Join Minimart" : "Welcome Back"}
      </h2>

      {error && (
        <div style={{ 
          background: "#fee", 
          color: "#c33", 
          padding: 10, 
          borderRadius: 4, 
          marginBottom: 15,
          border: "1px solid #fcc"
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
            style={{ 
              width: "100%", 
              padding: "12px", 
              marginBottom: 12, 
              border: "1px solid #ddd", 
              borderRadius: 4,
              boxSizing: "border-box"
            }}
          />
          <input
            type="tel"
            placeholder="Phone Number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "12px", 
              marginBottom: 12, 
              border: "1px solid #ddd", 
              borderRadius: 4,
              boxSizing: "border-box"
            }}
          />
        </>
      )}
      
      <input
        type="email"
        placeholder="Email Address *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ 
          width: "100%", 
          padding: "12px", 
          marginBottom: 12, 
          border: "1px solid #ddd", 
          borderRadius: 4,
          boxSizing: "border-box"
        }}
      />
      
      <input
        type="password"
        placeholder="Password *"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ 
          width: "100%", 
          padding: "12px", 
          marginBottom: 20, 
          border: "1px solid #ddd", 
          borderRadius: 4,
          boxSizing: "border-box"
        }}
      />

      <button
        onClick={login}
        disabled={loading}
        style={{ 
          width: "100%", 
          padding: "14px", 
          marginBottom: 12, 
          background: isRegister ? "#f8f9fa" : "#007bff",
          color: isRegister ? "#333" : "white",
          border: "1px solid #ddd",
          borderRadius: 4,
          fontSize: 16,
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Signing In..." : "Login"}
      </button>

      <button
        onClick={register}
        disabled={loading}
        style={{ 
          width: "100%", 
          padding: "14px", 
          background: isRegister ? "#28a745" : "#f8f9fa",
          color: isRegister ? "white" : "#333",
          border: "1px solid #ddd",
          borderRadius: 4,
          fontSize: 16,
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <div style={{ 
        textAlign: "center", 
        marginTop: 20, 
        paddingTop: 20, 
        borderTop: "1px solid #eee",
        fontSize: 14
      }}>
        <span style={{ color: "#666" }}>
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
            color: "#007bff",
            fontSize: 14,
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            textDecoration: "underline"
          }}
        >
          {isRegister ? "Sign in instead" : "Create free account"}
        </button>
      </div>
    </div>
  )
}