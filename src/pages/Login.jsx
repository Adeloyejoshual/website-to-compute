import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {

  const [isRegister, setIsRegister] = useState(false)

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)


  const validate = () => {

    setError("")

    if (!email || !password) {
      return "Enter email and password"
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

    if (!emailRegex.test(email)) {
      return "Valid email required"
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters"
    }

    if (isRegister && (!fullName || !phone)) {
      return "Fill all fields"
    }

    return null
  }


  const register = async () => {

    const err = validate()

    if (err) {
      setError(err)
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim()
        }
      }
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    alert("Account created. Check your email to confirm.")
    setIsRegister(false)
  }


  const login = async () => {

    const err = validate()

    if (err) {
      setError(err)
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim()
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    }
  }


  return (

    <div style={{
      maxWidth: "400px",
      margin: "60px auto",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}>

      <h2>{isRegister ? "Create Account" : "Login"}</h2>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {isRegister && (
        <>
          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </>
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={isRegister ? register : login}
        disabled={loading}
      >
        {loading ? "Loading..." : isRegister ? "Register" : "Login"}
      </button>

      <button
        onClick={() => {
          setIsRegister(!isRegister)
          setError("")
        }}
      >
        {isRegister
          ? "Already have account? Login"
          : "Create new account"}
      </button>

    </div>
  )
}