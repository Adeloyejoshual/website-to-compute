// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const walletRoutes = require('./routes/walletRoutes');
const rewardRoutes = require('./routes/rewardRoutes');

// JWT middleware
const { authenticateJWT } = require('./middleware/authMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CockroachDB connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 26257,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log('Connected to CockroachDB'))
  .catch(err => console.error('CockroachDB connection error', err));

// Make pool available in controllers
module.exports.pool = pool;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/admin', authenticateJWT, adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', authenticateJWT, orderRoutes);
app.use('/api/wallets', authenticateJWT, walletRoutes);
app.use('/api/rewards', authenticateJWT, rewardRoutes);

// Serve frontend (optional)
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Minimart backend running on port ${PORT}`);
});