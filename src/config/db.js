const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT, 10),
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
  process.exit(1);
});

const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection test successful');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};

testConnection();

module.exports = pool;