#!/usr/bin/env node

/**
 * Production Database Check Script
 * 
 * This script helps diagnose production database issues with Cloudinary configuration.
 * Run this after deploying to production to check if everything is set up correctly.
 */

const { PrismaClient } = require('@prisma/client');

async function checkProductionDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking production database...');
    
    // Test database connection
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\n💡 Solution: Check your DATABASE_URL environment variable in production');
      return;
    }
    
    // Check if site_settings table exists and has data
    try {
      const settings = await prisma.siteSettings.findFirst();
      
      if (!settings) {
        console.log('⚠️  No site settings found in database');
        console.log('💡 Solution: The database might be empty. Run database migrations first.');
        return;
      }
      
      console.log('✅ Site settings found in database');
      
      // Check Cloudinary configuration
      const cloudinaryConfig = {
        enabled: settings.cloudinaryEnabled,
        hasCloudName: !!settings.cloudinaryCloudName,
        hasApiKey: !!settings.cloudinaryApiKey,
        hasApiSecret: !!settings.cloudinaryApiSecret
      };
      
      console.log('📋 Cloudinary configuration:', cloudinaryConfig);
      
      if (!cloudinaryConfig.enabled) {
        console.log('❌ Cloudinary is not enabled in database');
        console.log('💡 Solution: Go to admin panel → Site Settings → Enable Cloudinary');
      } else if (!cloudinaryConfig.hasCloudName || !cloudinaryConfig.hasApiKey || !cloudinaryConfig.hasApiSecret) {
        console.log('❌ Cloudinary is enabled but missing credentials');
        console.log('💡 Solution: Go to admin panel → Site Settings → Enter Cloudinary credentials');
      } else {
        console.log('✅ Cloudinary is properly configured in database');
      }
      
    } catch (error) {
      console.error('❌ Error checking site settings:', error.message);
      console.log('💡 Solution: Run database migrations: npx prisma migrate deploy');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkProductionDatabase().catch(console.error);