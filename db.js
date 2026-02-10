
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.COCKROACH_URI,
  ssl: { rejectUnauthorized: false }
});

// Test DB connection on startup
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("CockroachDB connected:", res.rows[0]);
  } catch (err) {
    console.error("CockroachDB connection error:", err);
  }
})();

// Add product
export async function addProduct(name, description, price) {
  const query = `
    INSERT INTO products (name, description, price)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [name, description, price];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// Get all products
export async function getProducts() {
  const res = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
  return res.rows;
}