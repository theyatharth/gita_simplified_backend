const { Pool } = require('pg');
const pool = new Pool({

  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false,
  },
});


pool.connect()
  .then(() => console.log('PostgreSQL Connected'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = pool;
