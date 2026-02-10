// db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// Create connection pool
export const pool = new Pool({
  connectionString: process.env.COCKROACH_URI,
  ssl: { rejectUnauthorized: false },
});

// Initialize tables if missing
export async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name STRING NOT NULL,
        description STRING,
        price DECIMAL NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name STRING NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      )
    `);

    console.log("✅ Tables are ready");
  } catch (err) {
    console.error("❌ Error initializing tables:", err.stack);
  }
}

// Add product
export async function addProduct(name, description, price) {
  if (!name || price == null) throw new Error("Name and price are required");

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice)) throw new Error("Price must be a number");

  const res = await pool.query(
    `INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *`,
    [name, description || "", parsedPrice]
  );
  return res.rows[0];
}

// Get all products
export async function getProducts() {
  const res = await pool.query(`SELECT * FROM products ORDER BY created_at DESC`);
  return res.rows;
}