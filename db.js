import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.COCKROACH_URI,
  ssl: { rejectUnauthorized: false },
});

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

export async function getProducts() {
  const res = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
  return res.rows;
}