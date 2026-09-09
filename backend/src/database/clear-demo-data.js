/**
 * PRIME System — Clear Demo Data
 * 
 * Removes ALL sample/demo/test data while preserving:
 * - Database tables, columns, relationships, and structure
 * - SSNM/NOPT reference values (research-based configuration)
 * - Firebase, Socket.io, ESP32 connection mechanisms
 * - All code, endpoints, and business logic
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
  database: process.env.MYSQL_DATABASE || 'prime_db',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  dateStrings: true
};

async function clearDemoData() {
  console.log('🧹 PRIME System — Clearing Demo Data');
  console.log(`   Database: ${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port}`);
  console.log('');

  const conn = await mysql.createConnection(dbConfig);

  // Disable foreign key checks temporarily for clean truncation
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  // Clear all data tables in dependency order
  // These contain ONLY demo/sample data
  const dataTables = [
    'activity_logs',
    'alerts',
    'fertilizer_logs',
    'recommendations',
    'sensor_readings',
    'devices',
    'fields',
    'users',
  ];

  for (const table of dataTables) {
    const [result] = await conn.query(`SELECT COUNT(*) as count FROM ${table}`);
    const count = result[0].count;
    await conn.query(`TRUNCATE TABLE ${table}`);
    console.log(`   ✅ Cleared ${table} (${count} rows removed)`);
  }

  // Re-enable foreign key checks
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  // Verify reference_values are preserved
  const [refRows] = await conn.query('SELECT COUNT(*) as count FROM reference_values');
  console.log(`\n   📊 Reference values preserved: ${refRows[0].count} rows (SSNM/NOPT thresholds)`);

  // List preserved reference values
  const [refs] = await conn.query('SELECT nutrient, growth_stage, min_sufficient, max_sufficient, unit FROM reference_values ORDER BY nutrient, growth_stage');
  if (refs.length > 0) {
    console.log('');
    console.log('   Preserved SSNM/NOPT Reference Thresholds:');
    console.log('   ─────────────────────────────────────────────────');
    for (const r of refs) {
      console.log(`     ${r.nutrient.padEnd(12)} │ ${r.growth_stage.padEnd(14)} │ ${r.min_sufficient}–${r.max_sufficient} ${r.unit}`);
    }
  }

  await conn.end();

  console.log('\n🎉 Demo data cleared successfully!');
  console.log('   The system is now in a clean state.');
  console.log('   All tables, structure, and reference values are preserved.');
  console.log('');
  console.log('   Next steps:');
  console.log('   1. Register a real admin user via the API or re-seed with real accounts');
  console.log('   2. Register real ESP32 devices');
  console.log('   3. Connect sensors to begin receiving real data');
  console.log('');
}

clearDemoData().catch(err => {
  console.error('❌ Clear failed:', err.message);
  console.error('   Make sure MySQL (XAMPP) is running.');
  process.exit(1);
});
