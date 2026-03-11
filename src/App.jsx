// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Homepage from "./pages/Homepage";
import AddProduct from "./pages/AddProduct";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Simple auth context
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);

  // Check localStorage for token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // decode JWT for role if needed
      setUser({ token });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route
            path="/add-product"
            element={user ? <AddProduct /> : <Navigate to="/login" replace />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;