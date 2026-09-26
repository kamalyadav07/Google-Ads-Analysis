const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'marketing_intelligence',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true
};

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * Ensures the target database exists on the MySQL instance
 */
async function ensureDatabaseExists() {
  const rootConfig = {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
  };

  try {
    const tempConn = await mysql.createConnection(rootConfig);
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConn.end();
  } catch (err) {
    // If permission denied or server not reachable, log and let normal pool handle error
    console.warn(`[DB Warning] Could not verify/create database '${dbConfig.database}': ${err.message}`);
  }
}

/**
 * Health check to verify MySQL connectivity
 */
async function testConnection() {
  try {
    await ensureDatabaseExists();
    const activePool = getPool();
    const [rows] = await activePool.query('SELECT 1 + 1 AS result');
    return {
      connected: true,
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      code: error.code
    };
  }
}

async function query(sql, params = []) {
  const activePool = getPool();
  return activePool.query(sql, params);
}

async function execute(sql, params = []) {
  const activePool = getPool();
  return activePool.execute(sql, params);
}

module.exports = {
  dbConfig,
  getPool,
  testConnection,
  ensureDatabaseExists,
  query,
  execute
};
