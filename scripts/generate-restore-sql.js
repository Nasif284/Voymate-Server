const fs = require('fs');
const path = require('path');

const backupPath = path.resolve(__dirname, '../../voymate_backup.sql');
const seedRolesPath = path.resolve(__dirname, '../seed_roles_countries.sql');

const backup = fs.readFileSync(backupPath, 'utf16le');
const seedRolesCountries = fs.readFileSync(seedRolesPath, 'utf8');

const lines = backup.split('\n');
let currentTable = null;
let currentCols = null;
const tables = {};

for (let line of lines) {
  line = line.replace('\r', '');
  if (line.startsWith('COPY public.')) {
    const match = line.match(/^COPY public\.([a-z_]+) \((.+)\) FROM stdin;/);
    if (match) {
      currentTable = match[1];
      currentCols = match[2].split(', ').map(c => c.trim());
      tables[currentTable] = { cols: currentCols, rows: [] };
    }
  } else if (line === '\\.') {
    currentTable = null;
  } else if (currentTable && line.trim().length > 0) {
    const values = line.split('\t');
    tables[currentTable].rows.push(values);
  }
}

function formatVal(col, val, table) {
  const cleanCol = col.replace(/^"|"$/g, '');
  if (val === '\\N' || val === undefined || val === null) return 'NULL';
  if (val === 't') return 'TRUE';
  if (val === 'f') return 'FALSE';
  
  if (table === 'assistant_message_embeddings' && cleanCol === 'embedding') {
    return `'${val}'::vector`;
  }
  
  if (table === 'user_locations' && cleanCol === 'coordinates') {
    return `'${val}'::geography`;
  }
  
  const escaped = val.replace(/'/g, "''");
  return `'${escaped}'`;
}

let sql = '-- Auto-generated Clean Cloud DB Restore Script\n';
sql += "SET session_replication_role = 'replica';\n\n";

const tablesToTruncate = [
  'admin_status_history', 'admins', 'assistant_message_embeddings', 'assistant_messages',
  'assistant_conversations', 'call_participants', 'calls', 'chat_message_attachments',
  'chat_messages', 'chat_conversations', 'community_trip_bookings', 'community_trips',
  'communities', 'connection_requests', 'connections', 'destinations', 'trip_matches',
  'trips', 'user_interests', 'user_languages', 'user_locations', 'user_onboarding',
  'user_privacy_settings', 'user_status_history', 'user_travel_skills', 'users',
  'verification_activities', 'verification_documents', 'verification_extracted_data',
  'verifications', 'roles', 'countries'
];

sql += '-- 1. Clear all existing data\n';
sql += 'TRUNCATE TABLE ' + tablesToTruncate.map(t => '"' + t + '"').join(', ') + ' CASCADE;\n\n';

sql += '-- 2. Seed clean Roles and Countries (with correct UTF-8 emojis)\n';
sql += seedRolesCountries.trim() + '\n\n';

for (const [table, data] of Object.entries(tables)) {
  if (table === 'countries' || table === 'roles' || table === '_prisma_migrations' || table === 'spatial_ref_sys') {
    continue;
  }
  if (data.rows.length === 0) continue;

  const colList = data.cols
    .map(c => `"${c.replace(/^"|"$/g, '')}"`)
    .join(', ');
  sql += `-- Table: ${table} (${data.rows.length} rows)\n`;
  sql += `INSERT INTO "${table}" (${colList}) VALUES\n`;
  const rowStrings = data.rows.map(row => {
    const formatted = row.map((v, i) => formatVal(data.cols[i], v, table));
    return '(' + formatted.join(', ') + ')';
  });
  sql += rowStrings.join(',\n') + ';\n\n';
}

sql += "SET session_replication_role = 'origin';\n";

const outPath = path.resolve(__dirname, '../restore_cloud_data.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Successfully generated restore_cloud_data.sql! Total bytes:', Buffer.byteLength(sql, 'utf8'));
