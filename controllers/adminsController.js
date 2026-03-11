const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../server');

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM admins WHERE email=$1', [email]);
    const admin = rows[0];
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, admin: { id: admin.id, name: admin.name, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { loginAdmin };