import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
const [email, setEmail] = useState("")
const [loading, setLoading] = useState(false)

const sendMagicLink = async () => {
if (!email) return alert("Enter your email")

setLoading(true)

const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: "https://website-to-compute-1mzb.onrender.com"
  }
})

if (error) {
  alert(error.message)
} else {
  alert("Check your email for the login link!")
}

setLoading(false)

}

return (
<div style={{ maxWidth: 400, margin: "60px auto" }}>
<h2>Login with Magic Link</h2>

  <input
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    style={{ width: "100%", padding: 10, marginBottom: 20 }}
  />

  <button
    onClick={sendMagicLink}
    disabled={loading}
    style={{
      width: "100%",
      padding: 12,
      background: "#007bff",
      color: "white"
    }}
  >
    {loading ? "Sending..." : "Send Magic Link"}
  </button>
</div>

)
}