import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { config } from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  console.log('--- Seeding InternHub MySQL Database ---');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
      multipleStatements: true
    });

    const adminHash = await bcrypt.hash('Admin@123', 10);
    const studentHash = await bcrypt.hash('Student@123', 10);

    const seedPath = path.resolve(__dirname, 'seed.sql');
    let sql = fs.readFileSync(seedPath, 'utf8');

    // Replace placeholders with freshly hashed passwords
    sql = sql.replace(/\$2a\$10\$QO0k4r70W[^\']+/g, adminHash);
    sql = sql.replace(/\$2a\$10\$wI5f67H55g[^\']+/g, studentHash);

    console.log('Executing seed SQL script...');
    await connection.query(sql);

    console.log('✅ Seed data inserted successfully!');
    console.log('--- Demo Accounts ---');
    console.log('Admin:   admin@internhub.com / Admin@123');
    console.log('Student: student@internhub.com / Student@123');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seedDatabase();
