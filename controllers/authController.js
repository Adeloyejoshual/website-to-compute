const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../server");

// ==============================
// Register User
// ==============================
const registerUser = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    email = email.toLowerCase();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1,$2,$3,$4)
      RETURNING id,name,email,role
    `;

    const values = [name, email, hashedPassword, role || "buyer"];

    const { rows } = await pool.query(query, values);

    res.status(201).json({
      message: "User registered successfully",
      user: rows[0],
    });

  } catch (err) {

    // Duplicate email
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email already exists" });
    }

    console.error("Register Error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ==============================
// Login User
// ==============================
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    email = email.toLowerCase();

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not set in environment variables");
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

module.exports = {
  registerUser,
  loginUser,
};