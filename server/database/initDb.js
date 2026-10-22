import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { config } from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  console.log('--- Initializing InternHub MySQL Database ---');
  console.log(`Connecting to MySQL host: ${config.db.host}:${config.db.port} as user: ${config.db.user}`);

  let connection;
  try {
    // Connect without selecting DB first so we can create it
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      multipleStatements: true
    });

    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`Executing schema script from: ${schemaPath}`);
    await connection.query(sql);

    console.log('✅ Database `internhub_db` and tables created successfully!');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.error('\nTips to resolve:');
    console.error('1. Check that MySQL service is running (MySQL80 on Windows)');
    console.error('2. Verify DB_PASSWORD in server/.env matches your root password');
    console.error('3. Run `npm run db:init` again after updating .env');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
