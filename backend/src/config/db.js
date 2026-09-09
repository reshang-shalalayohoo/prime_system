const mysql = require('mysql2/promise');

let pool = null;

/**
 * Initialize and return the MySQL connection pool.
 * Uses environment variables for configuration.
 */
function getPool() {
  if (!pool) {
    let sslConfig = undefined;
    if (process.env.MYSQL_SSL === 'true' || process.env.MYSQL_SSL === '1') {
      sslConfig = {
        rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED === 'true'
      };
      if (process.env.MYSQL_CA_CERT) {
        sslConfig.ca = process.env.MYSQL_CA_CERT;
      }
    }

    const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;

    const baseConfig = connectionUri
      ? {
          uri: connectionUri,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          rowsAsArray: false,
          dateStrings: true,
          multipleStatements: false,
          ...(sslConfig && { ssl: sslConfig })
        }
      : {
          host: process.env.MYSQL_HOST || 'localhost',
          port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
          database: process.env.MYSQL_DATABASE || 'prime_db',
          user: process.env.MYSQL_USER || 'root',
          password: process.env.MYSQL_PASSWORD || '',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          rowsAsArray: false,
          dateStrings: true,
          multipleStatements: false,
          ...(sslConfig && { ssl: sslConfig })
        };

    pool = mysql.createPool(baseConfig);
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
