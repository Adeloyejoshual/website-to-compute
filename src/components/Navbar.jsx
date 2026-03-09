import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useState } from "react";

export default function Navbar({ session }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const logout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
  };

  return (
    <nav
      style={{
        padding: "1rem 2rem",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Left links */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link to="/">Home</Link>
        <Link to="/add">Add Product</Link>
      </div>

      {/* Right side: Login or Profile */}
      <div style={{ position: "relative" }}>
        {!session ? (
          <Link to="/login">Login</Link>
        ) : (
          <>
            {/* Profile Icon */}
            <button
              onClick={toggleDropdown}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              👤
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "2.5rem",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  minWidth: 140,
                  zIndex: 1000,
                }}
              >
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: "block",
                    padding: "0.75rem 1rem",
                    textDecoration: "none",
                    color: "#333",
                  }}
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#333",
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}