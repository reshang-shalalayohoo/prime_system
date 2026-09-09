const mysql = require('mysql2/promise');

let pool = null;

/**
 * Initialize and return the MySQL connection pool.
 * Uses environment variables for configuration.
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
      database: process.env.MYSQL_DATABASE || 'prime_db',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // Return rows as plain objects (same shape as better-sqlite3)
      rowsAsArray: false,
      // Ensure dates come back as JS Date objects
      dateStrings: true,
      // Enable multiple statements for schema import
      multipleStatements: false,
      // SSL for cloud MySQL providers (Aiven, TiDB, PlanetScale)
      ...(process.env.MYSQL_SSL === 'true' && { ssl: { rejectUnauthorized: true } })
    });
  }
  return pool;
}

/**
 * Helper: execute a parameterized query and return [rows, fields].
 * Usage: const [rows] = await query('SELECT * FROM users WHERE id = ?', [1]);
 */
async function query(sql, params = []) {
  const p = getPool();
  return p.execute(sql, params);
}

/**
 * Test the database connection. Call during startup.
 */
async function testConnection() {
  const p = getPool();
  const conn = await p.getConnection();
  try {
    await conn.ping();
    console.log('✅ MySQL connected successfully');
  } finally {
    conn.release();
  }
}

/**
 * Close the connection pool. Call during graceful shutdown.
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getPool, query, testConnection, closePool };
