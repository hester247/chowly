const { Pool } = require("pg");

require("dotenv").config();

const isRenderDatabase =
  process.env.DB_HOST &&
  process.env.DB_HOST.includes("render.com");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Render PostgreSQL requires SSL.
  // Local PostgreSQL can continue without SSL.
  ssl: isRenderDatabase
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

module.exports = pool;