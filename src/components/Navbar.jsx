import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function Navbar({ session }) {
  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav
      style={{
        padding: "1rem",
        borderBottom: "1px solid #ddd",
        display: "flex",
        gap: "1rem",
      }}
    >
      <Link to="/">Home</Link>
      <Link to="/add">Add Product</Link>

      {!session ? (
        <Link to="/login">Login</Link>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </nav>
  )
}