const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

pool.on('error', (err) => {
  console.error('Unexpected database idle client error:', err.message);
});

pool.query('SELECT 1')
  .then(() => console.log('Neon Database connected successfully!'))
  .catch((err) => console.error('Database connection error:', err.message));

module.exports = pool;
