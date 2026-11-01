const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  console.log('====================================================');
  console.log('   VOYMATE CLOUD DATABASE RESTORE & VERIFICATION    ');
  console.log('====================================================');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  // Find restore_cloud_data.sql
  const searchPaths = [
    path.resolve(__dirname, '../restore_cloud_data.sql'),
    path.resolve(__dirname, 'restore_cloud_data.sql'),
    path.resolve(process.cwd(), 'restore_cloud_data.sql')
  ];

  let sqlPath = null;
  for (const p of searchPaths) {
    if (fs.existsSync(p)) {
      sqlPath = p;
      break;
    }
  }

  if (!sqlPath) {
    console.error('❌ ERROR: restore_cloud_data.sql could not be found.');
    process.exit(1);
  }

  console.log(`[INFO] Reading SQL script from: ${sqlPath}`);
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
  const client = new Client({
    connectionString: dbUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });

  console.log('[INFO] Connecting to Cloud PostgreSQL database...');
  await client.connect();
  console.log('✅ Connected successfully!');

  console.log('[INFO] Executing database cleanup and restore script...');
  const startTime = Date.now();
  await client.query(sqlContent);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Restore SQL executed successfully in ${duration}s!`);

  console.log('\n====================================================');
  console.log('               VERIFYING SEEDED DATA                ');
  console.log('====================================================');

  const expectedCounts = [
    { table: 'roles', expected: 3 },
    { table: 'countries', expected: 102 },
    { table: 'admins', expected: 3 },
    { table: 'users', expected: 7 },
    { table: 'user_onboarding', expected: 7 },
    { table: 'user_privacy_settings', expected: 7 },
    { table: 'user_locations', expected: 7 },
    { table: 'user_interests', expected: 21 },
    { table: 'user_languages', expected: 16 },
    { table: 'user_travel_skills', expected: 14 },
    { table: 'user_status_history', expected: 7 },
    { table: 'destinations', expected: 7 },
    { table: 'trips', expected: 8 },
    { table: 'communities', expected: 1 },
    { table: 'community_trips', expected: 1 },
    { table: 'community_trip_bookings', expected: 1 },
    { table: 'connection_requests', expected: 2 },
    { table: 'assistant_conversations', expected: 1 },
    { table: 'assistant_messages', expected: 2 },
    { table: 'assistant_message_embeddings', expected: 2 }
  ];

  let hasMismatch = false;
  console.log('----------------------------------------------------------------------');
  console.log(
    'Table Name'.padEnd(32) +
    'Expected'.padStart(10) +
    'Actual'.padStart(10) +
    '   Status'
  );
  console.log('----------------------------------------------------------------------');

  for (const item of expectedCounts) {
    const res = await client.query(`SELECT count(*)::int AS count FROM "${item.table}"`);
    const actual = res.rows[0].count;
    const isMatch = actual === item.expected;
    if (!isMatch) hasMismatch = true;

    const status = isMatch ? '✅ MATCH' : `❌ MISMATCH (Diff: ${actual - item.expected})`;
    console.log(
      item.table.padEnd(32) +
      String(item.expected).padStart(10) +
      String(actual).padStart(10) +
      '   ' + status
    );
  }
  console.log('----------------------------------------------------------------------');

  await client.end();

  if (hasMismatch) {
    console.error('❌ Verification failed: One or more tables have unexpected row counts.');
    process.exit(1);
  } else {
    console.log('🎉 ALL TABLES VERIFIED AND RESTORED SUCCESSFULLY!');
    process.exit(0);
  }
}

run().catch(err => {
  console.error('❌ UNHANDLED RESTORE ERROR:', err);
  process.exit(1);
});
