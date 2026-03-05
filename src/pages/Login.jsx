import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // REGISTER
  const register = async () => {
    if (!email || !password) {
      alert("Enter email and password")
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    })

    if (error) {
      alert(error.message)
      return
    }

    // create user record in users table
    await supabase.from("users").insert([
      {
        auth_id: data.user.id,
        email: data.user.email
      }
    ])

    alert("Account created successfully")
  }

  // LOGIN
  const login = async () => {
    if (!email || !password) {
      alert("Enter email and password")
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) {
      alert(error.message)
      return
    }

    alert("Login successful")
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login / Register</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={login}>Login</button>

      <button onClick={register} style={{ marginLeft: 10 }}>
        Register
      </button>
    </div>
  )
}