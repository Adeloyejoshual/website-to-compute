import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.COCKROACH_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("CockroachDB connected:", res.rows[0]);
  } catch (err) {
    console.error("CockroachDB connection error:", err);
  }
}