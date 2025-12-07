#!/usr/bin/env node

/**
 * Vercel build script that handles database migrations and seeding
 * Gracefully handles missing DATABASE_URL (e.g., for preview deployments)
 */

const { execSync } = require('child_process');

function runCommand(command, description) {
  try {
    console.log(`\n📦 ${description}...`);
    execSync(command, { stdio: 'inherit', env: process.env });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Vercel build process...');
  console.log('='.repeat(60));

  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn('\n⚠️  WARNING: DATABASE_URL is not set');
    console.warn('   Skipping database migrations and seeding.');
    console.warn('   Make sure to set DATABASE_URL in Vercel environment variables.');
    console.warn('   For SQLite, use format: file:./prisma/prod.db');
    console.warn('   For PostgreSQL, use format: postgresql://user:password@host:port/database');
    console.log('\n📦 Building Next.js application...');
    runCommand('next build', 'Next.js build');
    return;
  }

  // Validate DATABASE_URL format for SQLite
  if (databaseUrl.startsWith('file:')) {
    console.log('✅ DATABASE_URL detected (SQLite format)');
  } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    console.log('✅ DATABASE_URL detected (PostgreSQL format)');
    console.warn('⚠️  NOTE: Schema is configured for SQLite. Consider updating prisma/schema.prisma');
    console.warn('   to use PostgreSQL for production: provider = "postgresql"');
  } else {
    console.warn(`⚠️  WARNING: DATABASE_URL format may be invalid: ${databaseUrl.substring(0, 20)}...`);
  }

  // Run migrations
  const migrationSuccess = runCommand('prisma migrate deploy', 'Database migrations');
  
  if (!migrationSuccess) {
    console.error('\n❌ Migration failed. Build will continue but database may be out of sync.');
    console.error('   Please check your DATABASE_URL and database connection.');
  }

  // Run seed scripts (only if migrations succeeded)
  if (migrationSuccess) {
    runCommand('npm run db:seed', 'Database seeding (main)');
    runCommand('npm run db:seed:positions', 'Database seeding (positions)');
    
    // Optionally run demo data if SEED_DEMO_DATA environment variable is set
    if (process.env.SEED_DEMO_DATA === 'true') {
      console.log('\n📦 Running demo data seeding (SEED_DEMO_DATA=true)...');
      runCommand('npm run demo:data', 'Database seeding (demo data)');
    } else {
      console.log('\nℹ️  Skipping demo data seeding (set SEED_DEMO_DATA=true to enable)');
    }
  } else {
    console.warn('\n⚠️  Skipping seeding due to migration failure');
  }

  // Build Next.js application
  console.log('\n📦 Building Next.js application...');
  const buildSuccess = runCommand('next build', 'Next.js build');
  
  if (!buildSuccess) {
    console.error('\n❌ Build failed');
    process.exit(1);
  }

  console.log('\n✅ Vercel build completed successfully!');
}

main().catch((error) => {
  console.error('\n❌ Fatal error during build:', error);
  process.exit(1);
});

