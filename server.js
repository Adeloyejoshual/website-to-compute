// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// CockroachDB connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

// Export pool for controllers
module.exports.pool = pool;

// ==================== Controllers =========================
const authController = require('./controllers/authController');
const usersController = require('./controllers/usersController');
const adminsController = require('./controllers/adminsController');
const productsController = require('./controllers/productsController');
const ordersController = require('./controllers/ordersController');
const walletsController = require('./controllers/walletsController');
const rewardsController = require('./controllers/rewardsController');

// ==================== Middleware =========================
const { authenticateJWT } = require('./middleware/authMiddleware');
const { authorizeRole } = require('./middleware/roleMiddleware');

// ==================== Routes ==============================
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const walletRoutes = require('./routes/walletRoutes');
const rewardRoutes = require('./routes/rewardRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/admin', authenticateJWT, authorizeRole(['super_admin','manager','moderator','finance','support']), adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', authenticateJWT, orderRoutes);
app.use('/api/wallets', authenticateJWT, walletRoutes);
app.use('/api/rewards', authenticateJWT, rewardRoutes);

// Health Check
app.get('/', (req, res) => res.send('Minimart Backend Running'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));