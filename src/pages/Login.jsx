import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) return alert("Signup error: " + error.message)

    alert("Check your email to confirm your account!")
  }

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return alert("Login error: " + error.message)

    const user = data.user
    if (!user) return

    // Ensure user exists in public.users
    const { data: dbUser } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", user.id)
      .single()

    if (!dbUser) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          auth_id: user.id,
          email: user.email,
          full_name: "", // optionally ask user to fill this later
          phone: "",
          is_seller: true,
          marketplace_type: "africa",
        },
      ])
      if (insertError) console.log("Error inserting user:", insertError)
    }

    alert("Login successful!")
  }

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Login / Register</h2>
      <input
        type="email"
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
      <button onClick={signUp}>Sign Up</button>
      <button onClick={signIn}>Login</button>
    </div>
  )
}