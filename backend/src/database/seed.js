const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const schemaPath = path.join(__dirname, 'schema.sql');

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  multipleStatements: true,
  dateStrings: true
};

const DB_NAME = process.env.MYSQL_DATABASE || 'prime_db';

async function seed() {
  console.log('🌾 PRIME System — Database Seeding (MySQL)');
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   Database: ${DB_NAME}`);

  // Connect without specifying a database first to create it
  const rootConn = await mysql.createConnection(dbConfig);

  // Drop and recreate the database for a clean seed
  await rootConn.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
  await rootConn.query(`CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`   Database '${DB_NAME}' created`);
  await rootConn.end();

  // Connect to the new database
  const conn = await mysql.createConnection({
    ...dbConfig,
    database: DB_NAME
  });

  // Execute schema
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  await conn.query(schema);
  console.log('✅ Schema created successfully');

  // Seed users
  const saltRounds = 10;
  const farmerHash = await bcrypt.hash('password123', saltRounds);
  const adminHash = await bcrypt.hash('password123', saltRounds);

  await conn.execute(
    'INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
    ['farmer1', 'farmer1@prime.local', farmerHash, 'Juan Dela Cruz', 'farmer']
  );
  await conn.execute(
    'INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
    ['admin1', 'admin1@prime.local', adminHash, 'Maria Santos', 'admin']
  );
  console.log('✅ Demo accounts created');
  console.log('   Farmer:  farmer1 / password123');
  console.log('   Admin:   admin1 / password123');

  // Seed fields
  await conn.execute(
    'INSERT INTO fields (name, location, area_hectares, crop_type, growth_stage, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    ['Main Rice Paddy', 'Brgy. San Jose, Nueva Ecija', 2.5, 'Palay', 'Vegetative', 1]
  );
  await conn.execute(
    'INSERT INTO fields (name, location, area_hectares, crop_type, growth_stage, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    ['East Field', 'Brgy. San Jose, Nueva Ecija', 1.8, 'Palay', 'Reproductive', 1]
  );
  console.log('✅ Demo fields created');

  // Seed devices
  await conn.execute(
    'INSERT INTO devices (device_code, api_key, device_name, field_id, status, battery_level, last_communication) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    ['ESP32-001', 'prime-device-key-001-abc123', 'Sensor Node Alpha', 1, 'online', 87.5]
  );
  await conn.execute(
    'INSERT INTO devices (device_code, api_key, device_name, field_id, status, battery_level, last_communication) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    ['ESP32-002', 'prime-device-key-002-def456', 'Sensor Node Beta', 2, 'online', 92.0]
  );
  console.log('✅ Demo devices created');
  console.log('   Device 1: ESP32-001 / API Key: prime-device-key-001-abc123');
  console.log('   Device 2: ESP32-002 / API Key: prime-device-key-002-def456');

  // Seed SSNM/NOPT reference values
  const refData = [
    ['nitrogen', 'Seedling', 20, 40],
    ['nitrogen', 'Vegetative', 30, 60],
    ['nitrogen', 'Reproductive', 25, 50],
    ['nitrogen', 'Ripening', 15, 35],
    ['phosphorus', 'Seedling', 10, 25],
    ['phosphorus', 'Vegetative', 15, 35],
    ['phosphorus', 'Reproductive', 12, 30],
    ['phosphorus', 'Ripening', 8, 20],
    ['potassium', 'Seedling', 15, 35],
    ['potassium', 'Vegetative', 20, 45],
    ['potassium', 'Reproductive', 18, 40],
    ['potassium', 'Ripening', 12, 30],
  ];

  for (const [nutrient, stage, min, max] of refData) {
    await conn.execute(
      "INSERT INTO reference_values (nutrient, growth_stage, min_sufficient, max_sufficient, unit, updated_by) VALUES (?, ?, ?, ?, 'mg/kg', 2)",
      [nutrient, stage, min, max]
    );
  }
  console.log('✅ SSNM/NOPT reference values seeded (4 growth stages × 3 nutrients)');

  // Helper functions for recommendations
  function classify(value, min, max) {
    if (value < min) return 'Deficient';
    if (value > max) return 'Excess';
    return 'Sufficient';
  }

  function generateRec(nStatus, pStatus, kStatus) {
    const deficiencies = [];
    if (nStatus === 'Deficient') deficiencies.push('Nitrogen');
    if (pStatus === 'Deficient') deficiencies.push('Phosphorus');
    if (kStatus === 'Deficient') deficiencies.push('Potassium');

    if (deficiencies.length === 0 && nStatus === 'Sufficient' && pStatus === 'Sufficient' && kStatus === 'Sufficient') {
      return {
        type: 'None Required',
        rate: '0 kg/ha',
        text: 'All nutrient levels are within the sufficient range. No additional fertilizer application is needed at this time. Continue regular monitoring.'
      };
    }

    const parts = [];
    let type = '';
    let rate = '';

    if (nStatus === 'Deficient') {
      parts.push('Apply nitrogen-based fertilizer (Urea 46-0-0) to address nitrogen deficiency.');
      type = 'Urea (46-0-0)';
      rate = '50 kg/ha';
    }
    if (pStatus === 'Deficient') {
      parts.push('Apply phosphorus supplement (Solophos 0-18-0) to correct phosphorus deficiency.');
      type = type ? 'Complete (14-14-14)' : 'Solophos (0-18-0)';
      rate = type.includes('Complete') ? '75 kg/ha' : '40 kg/ha';
    }
    if (kStatus === 'Deficient') {
      parts.push('Apply potassium supplement (Muriate of Potash 0-0-60) to address potassium deficiency.');
      type = (parts.length > 1) ? 'Complete (14-14-14)' : 'Muriate of Potash (0-0-60)';
      rate = (parts.length > 1) ? '75 kg/ha' : '35 kg/ha';
    }

    if (nStatus === 'Excess') parts.push('Reduce nitrogen application. Current levels exceed optimal range.');
    if (pStatus === 'Excess') parts.push('Reduce phosphorus application. Current levels exceed optimal range.');
    if (kStatus === 'Excess') parts.push('Reduce potassium application. Current levels exceed optimal range.');

    if (!type && parts.length > 0) {
      type = 'Adjustment Needed';
      rate = 'Reduce current rates';
    }

    return { type: type || 'Monitor', rate: rate || 'N/A', text: parts.join(' ') };
  }

  // Generate 20 readings spread over the last 10 days
  const now = new Date();
  const readings = [];
  for (let i = 19; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 12 * 60 * 60 * 1000);
    const moisture = 45 + Math.random() * 35;
    const water = 30 + Math.random() * 50;
    const n = 15 + Math.random() * 55;
    const p = 5 + Math.random() * 40;
    const k = 10 + Math.random() * 50;

    readings.push({
      deviceId: 1,
      fieldId: 1,
      moisture: Math.round(moisture * 10) / 10,
      water: Math.round(water * 10) / 10,
      n: Math.round(n * 10) / 10,
      p: Math.round(p * 10) / 10,
      k: Math.round(k * 10) / 10,
      ts: ts.toISOString().replace('T', ' ').substring(0, 19)
    });
  }

  // Vegetative stage refs: N(30-60), P(15-35), K(20-45)
  for (const r of readings) {
    const [readingResult] = await conn.execute(
      'INSERT INTO sensor_readings (device_id, field_id, soil_moisture, water_level, nitrogen, phosphorus, potassium, is_valid, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)',
      [r.deviceId, r.fieldId, r.moisture, r.water, r.n, r.p, r.k, r.ts]
    );
    const readingId = readingResult.insertId;

    const nStatus = classify(r.n, 30, 60);
    const pStatus = classify(r.p, 15, 35);
    const kStatus = classify(r.k, 20, 45);
    const rec = generateRec(nStatus, pStatus, kStatus);

    await conn.execute(
      'INSERT INTO recommendations (sensor_reading_id, field_id, n_status, p_status, k_status, fertilizer_type, application_rate, recommendation_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [readingId, r.fieldId, nStatus, pStatus, kStatus, rec.type, rec.rate, rec.text, r.ts]
    );
  }
  console.log('✅ 20 demo sensor readings with recommendations seeded');

  // Seed fertilizer logs
  const fertData = [
    [1, 1, 'Urea (46-0-0)', 50, 'Applied based on PRIME recommendation for nitrogen deficiency', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
    [1, 1, 'Complete (14-14-14)', 75, 'Basal application at start of vegetative stage', new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
    [1, 1, 'Muriate of Potash (0-0-60)', 35, 'Top dress for potassium supplement', new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
  ];

  for (const f of fertData) {
    await conn.execute(
      'INSERT INTO fertilizer_logs (field_id, user_id, fertilizer_type, amount_kg, notes, applied_at) VALUES (?, ?, ?, ?, ?, ?)',
      f
    );
  }
  console.log('✅ Demo fertilizer logs seeded');

  // Seed alerts
  const alertData = [
    [1, 1, 'nutrient_deficiency', 'Nitrogen level (18.5 mg/kg) is below the sufficient range for Vegetative stage. Consider applying nitrogen-based fertilizer.', 'warning', 0, new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
    [1, 1, 'nutrient_excess', 'Potassium level (52.3 mg/kg) exceeds the sufficient range for Vegetative stage. Reduce potassium application.', 'warning', 1, new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
    [1, 1, 'system', 'PRIME System initialized. Welcome to your nutrient monitoring dashboard.', 'info', 1, new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
    [null, null, 'device_offline', 'Device ESP32-002 has not communicated for over 30 minutes.', 'critical', 0, new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
  ];

  for (const a of alertData) {
    await conn.execute(
      'INSERT INTO alerts (field_id, user_id, type, message, severity, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      a
    );
  }
  console.log('✅ Demo alerts seeded');

  // Seed activity logs
  const activityData = [
    [1, 'Applied Fertilizer', 'fertilizer_log', 1, 'Applied 50 kg/ha Urea (46-0-0) to Main Rice Paddy', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
    [2, 'Updated Reference Values', 'reference_value', null, 'Updated nitrogen thresholds for Vegetative stage', new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
    [2, 'Created User', 'user', 1, 'Created farmer account: farmer1', new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
    [1, 'Applied Fertilizer', 'fertilizer_log', 2, 'Applied 75 kg/ha Complete (14-14-14) to Main Rice Paddy', new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
    [2, 'Registered Device', 'device', 1, 'Registered ESP32-001 and assigned to Main Rice Paddy', new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)],
  ];

  for (const a of activityData) {
    await conn.execute(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      a
    );
  }
  console.log('✅ Demo activity logs seeded');

  await conn.end();
  console.log('\n🎉 PRIME database seeded successfully!');
  console.log('   Ready to start the backend with: npm start\n');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  console.error('   Make sure MySQL (XAMPP) is running.');
  process.exit(1);
});
