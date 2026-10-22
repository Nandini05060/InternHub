import mysql from 'mysql2/promise';
import { config } from '../config/env.js';

let pool = null;
let isMySqlConnected = false;

export async function getDbPool() {
  if (pool) return pool;

  try {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
      waitForConnections: true,
      connectionLimit: config.db.connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    connection.release();
    isMySqlConnected = true;
    console.log(`[Database] Successfully connected to MySQL at ${config.db.host}:${config.db.port}/${config.db.name}`);
    return pool;
  } catch (error) {
    isMySqlConnected = false;
    pool = null;
    console.warn(`\n[Database Advisory] MySQL connection could not be established: ${error.message}`);
    console.warn(`[Database Advisory] Falling back to high-fidelity In-Memory / Relational Store.`);
    console.warn(`[Database Advisory] To connect your local MySQL:`);
    console.warn(`  1. Ensure MySQL service is running`);
    console.warn(`  2. Set DB_PASSWORD in server/.env`);
    console.warn(`  3. Run: npm run db:init && npm run db:seed\n`);
    return null;
  }
}

export function isDbConnected() {
  return isMySqlConnected;
}
