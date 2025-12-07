#!/usr/bin/env node

/**
 * Script to run demo data seeding remotely (e.g., on Vercel)
 * Usage: 
 *   - Locally: vercel env pull .env.production && node scripts/run-demo-data-remote.js
 *   - Or set DATABASE_URL and run: DATABASE_URL=... node scripts/run-demo-data-remote.js
 */

const { execSync } = require('child_process');

async function main() {
  console.log('🌱 Running demo data seeding...');
  console.log('='.repeat(60));

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    console.error('   Please set DATABASE_URL environment variable');
    console.error('   Or run: vercel env pull .env.production && node scripts/run-demo-data-remote.js');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL is set');
  console.log(`   Format: ${process.env.DATABASE_URL.startsWith('postgresql://') || process.env.DATABASE_URL.startsWith('postgres://') ? 'PostgreSQL' : 'SQLite'}`);

  try {
    console.log('\n📦 Running demo data script...');
    execSync('npm run demo:data', { 
      stdio: 'inherit', 
      env: process.env 
    });
    console.log('\n✅ Demo data seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Demo data seeding failed:', error.message);
    process.exit(1);
  }
}

main();

