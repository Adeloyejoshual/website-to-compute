const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_URL,
});

pool.on("connect", () => console.log("Connected to CockroachDB"));

module.exports = pool;