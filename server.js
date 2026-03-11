const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

// -------------------
// CockroachDB
// -------------------
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 26257,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ Connected to CockroachDB"))
  .catch(err => console.error("❌ CockroachDB connection error", err));

module.exports.pool = pool;

// -------------------
// Middlewares
// -------------------
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------
// Routes
// -------------------
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const walletRoutes = require("./routes/walletRoutes");
const rewardRoutes = require("./routes/rewardRoutes");

const { authenticateJWT } = require("./middleware/authMiddleware");

app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateJWT, userRoutes);
app.use("/api/admin", authenticateJWT, adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", authenticateJWT, orderRoutes);
app.use("/api/wallets", authenticateJWT, walletRoutes);
app.use("/api/rewards", authenticateJWT, rewardRoutes);

// -------------------
// Serve React frontend
// -------------------
const frontendBuildPath = path.join(__dirname, "frontend/dist");
app.use(express.static(frontendBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// -------------------
// 404 handler
// -------------------
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// -------------------
// Start server
// -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Minimart backend running on port ${PORT}`));