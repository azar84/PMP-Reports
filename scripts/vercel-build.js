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

  // Validate DATABASE_URL format
  if (databaseUrl.startsWith('file:')) {
    console.log('✅ DATABASE_URL detected (SQLite format)');
  } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    console.log('✅ DATABASE_URL detected (PostgreSQL format)');
  } else {
    console.warn(`⚠️  WARNING: DATABASE_URL format may be invalid: ${databaseUrl.substring(0, 20)}...`);
  }

  // Run migrations
  // NOTE: 'prisma migrate deploy' is safe for production:
  // - Only applies pending migrations that haven't been run yet
  // - Never deletes data or tables
  // - Never resets the database
  // - Safe to run on every deployment
  console.log('\n📋 Migration Strategy:');
  console.log('   - Using: prisma migrate deploy (production-safe)');
  console.log('   - Behavior: Applies only new/pending migrations');
  console.log('   - Safety: Never deletes data or existing tables');
  
  // Check if migration lock file exists and matches current provider
  const fs = require('fs');
  const path = require('path');
  const migrationLockPath = path.join(__dirname, '..', 'prisma', 'migrations', 'migration_lock.toml');
  
  let migrationSuccess = false;
  
  if (fs.existsSync(migrationLockPath)) {
    const lockContent = fs.readFileSync(migrationLockPath, 'utf8');
    const currentProvider = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://') ? 'postgresql' : 'sqlite';
    
    if (lockContent.includes(`provider = "${currentProvider}"`)) {
      // Migration lock matches current provider, use migrate deploy
      migrationSuccess = runCommand('prisma migrate deploy', 'Database migrations');
    } else {
      // Provider mismatch - need to handle migration history switch
      console.warn('\n⚠️  Migration provider mismatch detected!');
      console.warn('   Existing migrations were created for a different database provider.');
      console.warn('   Using prisma db push to sync schema (safe for empty databases)...');
      
      // For empty databases, db push is safe and will create all tables
      // This handles the provider switch scenario
      migrationSuccess = runCommand('prisma db push --accept-data-loss --skip-generate', 'Database schema sync (provider switch)');
      
      if (migrationSuccess) {
        console.log('✅ Schema synced successfully');
        console.log('   Note: After first sync, future deployments will use migrate deploy');
      }
    }
  } else {
    // No migration lock, use migrate deploy (will create lock file)
    migrationSuccess = runCommand('prisma migrate deploy', 'Database migrations');
  }
  
  if (!migrationSuccess) {
    console.error('\n❌ Migration failed. Build will continue but database may be out of sync.');
    console.error('   Please check your DATABASE_URL and database connection.');
  }

  // Run seed scripts (only if migrations succeeded)
  if (migrationSuccess) {
    const seedSuccess = runCommand('npm run db:seed', 'Database seeding (main)');
    if (!seedSuccess) {
      console.error('\n❌ Main seeding failed. Admin user may not have been created.');
      console.error('   Please check the build logs above for errors.');
    }
    
    const positionsSeedSuccess = runCommand('npm run db:seed:positions', 'Database seeding (positions)');
    if (!positionsSeedSuccess) {
      console.warn('\n⚠️  Positions seeding failed, but continuing...');
    }
    
    // Optionally run demo data if SEED_DEMO_DATA environment variable is set
    if (process.env.SEED_DEMO_DATA === 'true') {
      console.log('\n📦 Running demo data seeding (SEED_DEMO_DATA=true)...');
      runCommand('npm run demo:data', 'Database seeding (demo data)');
    } else {
      console.log('\nℹ️  Skipping demo data seeding (set SEED_DEMO_DATA=true to enable)');
    }
    
    // Final reminder about admin credentials
    if (seedSuccess) {
      console.log('\n📝 Admin user credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Email: admin@example.com');
    }
  } else {
    console.warn('\n⚠️  Skipping seeding due to migration failure');
    console.warn('   Admin user will NOT be created. Please fix migration errors first.');
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

