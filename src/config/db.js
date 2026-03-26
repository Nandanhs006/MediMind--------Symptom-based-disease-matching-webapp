const { Pool } = require('pg');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.development'
});

const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD || process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT, 10),
};

if (process.env.DB_SSL === 'require') {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Database error:', err);
});

const testDatabaseConnection = async () => {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log('Database connection unavailable:', err.message);
  }
};

testDatabaseConnection();

module.exports = pool;