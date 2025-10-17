const { execSync } = require('child_process');
const path = require('path');

const connectionString = 'postgresql://neondb_owner:npg_sJHvr0D5xhoi@ep-proud-king-a4o633cu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '..', 'backups');
const fs = require('fs');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Generate timestamp for filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const dumpFile = path.join(backupDir, `db-dump-${timestamp}.sql`);

console.log('🗄️  Starting database download...');
console.log(`📁 Backup will be saved to: ${dumpFile}`);

try {
  // Use pg_dump to download the database
  const command = `pg_dump "${connectionString}" --verbose --clean --if-exists --no-owner --no-privileges > "${dumpFile}"`;
  
  console.log('⏳ Downloading database (this may take a few minutes)...');
  execSync(command, { stdio: 'inherit' });
  
  console.log('✅ Database download completed successfully!');
  console.log(`📄 Dump file: ${dumpFile}`);
  
  // Get file size
  const stats = fs.statSync(dumpFile);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 File size: ${fileSizeInMB} MB`);
  
} catch (error) {
  console.error('❌ Error downloading database:', error.message);
  process.exit(1);
} 