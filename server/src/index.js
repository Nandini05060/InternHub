import app from './server.js';
import { config } from './config/env.js';
import { getDbPool } from './db/mysql.js';

async function startServer() {
  console.log('\n======================================================');
  console.log('  🚀 Starting InternHub Backend API Server');
  console.log('======================================================');

  // Attempt database connection pool initialization
  await getDbPool();

  const server = app.listen(config.port, () => {
    console.log(`[Server] InternHub API listening on http://localhost:${config.port}`);
    console.log(`[Server] Health check: http://localhost:${config.port}/api/health`);
    console.log(`[Server] Mode: ${config.nodeEnv}`);
    console.log('======================================================\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Server] Port ${config.port} is busy. Trying fallback port ${config.port + 1}...`);
      app.listen(config.port + 1, () => {
        console.log(`[Server] InternHub API listening on http://localhost:${config.port + 1}`);
      });
    } else {
      console.error('[Server Error]:', err);
    }
  });
}

startServer();
