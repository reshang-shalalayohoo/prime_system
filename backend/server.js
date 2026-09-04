require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/services/socket.service');
const { testConnection, closePool } = require('./src/config/db');
const { initFirebase } = require('./src/config/firebase');
const { startFirebaseListener, startHeartbeatMonitor, stopHeartbeatMonitor } = require('./src/services/sensorConnection.service');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Initialize MySQL connection pool and test it
    await testConnection();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    initSocket(server);

    // Initialize Firebase (gracefully handles missing config)
    initFirebase();

    // Start Firebase device heartbeat listener
    startFirebaseListener();

    // Start periodic heartbeat timeout monitor
    startHeartbeatMonitor();

    // Start server
    server.listen(PORT, () => {
      console.log(`\n🌾 PRIME System Backend`);
      console.log(`   Server running on http://localhost:${PORT}`);
      console.log(`   API base: http://localhost:${PORT}/api`);
      console.log(`   Health:   http://localhost:${PORT}/api/health`);
      console.log(`   Database: MySQL (${process.env.MYSQL_HOST || 'localhost'}:${process.env.MYSQL_PORT || 3306}/${process.env.MYSQL_DATABASE || 'prime_db'})`);
      console.log(`   Socket.io ready for connections\n`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down PRIME backend...');
      stopHeartbeatMonitor();
      await closePool();
      server.close(() => {
        console.log('   Server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 SIGTERM received — shutting down...');
      stopHeartbeatMonitor();
      await closePool();
      server.close(() => process.exit(0));
    });

  } catch (err) {
    console.error('❌ Failed to start PRIME backend:', err.message);
    console.error('   Make sure MySQL (XAMPP) is running and the database exists.');
    console.error('   Run "npm run seed" to create and populate the database.');
    process.exit(1);
  }
}

start();
