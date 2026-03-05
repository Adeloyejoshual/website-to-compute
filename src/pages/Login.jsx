import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const register = async () => {

    if (!fullName || !phone || !email || !password) {
      alert("Please fill all fields")
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    if (data?.user) {

      const { error: dbError } = await supabase
        .from("users")
        .insert([
          {
            auth_id: data.user.id,
            full_name: fullName,
            email: email,
            phone: phone,
            is_seller: false
          }
        ])

      if (dbError) {
        console.log(dbError)
        alert("Database error saving user")
      }
    }

    alert("Check your email to confirm signup")
    setLoading(false)
  }

  const login = async () => {

    if (!email || !password) {
      alert("Enter email and password")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) {
      alert(error.message)
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Login / Register</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 20 }}
      />

      <button
        onClick={login}
        disabled={loading}
        style={{ width: "100%", padding: 12, marginBottom: 10 }}
      >
        Login
      </button>

      <button
        onClick={register}
        disabled={loading}
        style={{ width: "100%", padding: 12 }}
      >
        Register
      </button>

    </div>
  )
}