import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const register = async () => {
    if (!email || !password) {
      alert("Enter email and password")
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
      const { error: dbError } = await supabase.from("users").insert([
        {
          auth_id: data.user.id,
          email: data.user.email,
          full_name: "",
          is_seller: false
        }
      ])

      if (dbError) {
        console.log(dbError)
      }
    }

    alert("Check your email to confirm your account")
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
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Login / Register</h2>

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
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <button
        onClick={login}
        disabled={loading}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      >
        Login
      </button>

      <button
        onClick={register}
        disabled={loading}
        style={{ width: "100%", padding: 10 }}
      >
        Register
      </button>
    </div>
  )
}