const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config({ path: '.env.saski' });

// Source database (saski-ai-website)
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.saski_DATABASE_URL
    }
  }
});

// Target database (local)
const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Available tables with descriptions
const availableTables = {
  'SiteSettings': 'Site configuration and settings',
  'DesignSystem': 'Design system colors and styling',
  'Page': 'Website pages and content',
  'HeroSection': 'Hero sections for pages',
  'Feature': 'Feature items and descriptions',
  'MediaSection': 'Media sections and galleries',
  'Menu': 'Navigation menus',
  'HeaderConfig': 'Header configuration',
  'CTA': 'Call-to-action buttons',
  'GlobalFunctions': 'Global JavaScript functions',
  'HomePageHero': 'Homepage hero section',
  'TrustIndicator': 'Trust indicators and badges',
  'GlobalFeature': 'Global feature settings',
  'FeatureGroup': 'Feature groups and categories',
  'FAQCategory': 'FAQ categories',
  'FAQ': 'FAQ questions and answers',
  'FAQSection': 'FAQ sections',
  'ContactSection': 'Contact form sections',
  'ContactField': 'Contact form fields',
  'Plan': 'Pricing plans',
  'BillingCycle': 'Billing cycle options',
  'PlanPricing': 'Plan pricing information',
  'PlanFeatureType': 'Plan feature types',
  'PlanFeatureLimit': 'Plan feature limits',
  'SharedFeature': 'Shared features across plans',
  'PlanFeature': 'Plan-specific features',
  'MediaLibrary': 'Media library items',
  'MediaFolder': 'Media folders',
  'PricingSection': 'Pricing sections',
  'Form': 'Custom forms',
  'FormField': 'Form fields',
  'HtmlSection': 'HTML sections',
  'NewsletterSubscriber': 'Newsletter subscribers',
  'TeamSection': 'Team sections',
  'TeamMember': 'Team member profiles',
  'AdminUser': 'Admin users',
  'ServiceAccountCredentials': 'Google service account credentials',
  'SitemapSubmissionLog': 'Sitemap submission logs'
};

async function copyTable(tableName) {
  try {
    console.log(`📋 Copying ${tableName}...`);
    
    // Get data from source
    const sourceData = await sourcePrisma[tableName].findMany();
    
    if (sourceData.length === 0) {
      console.log(`   ⚠️  No data found in ${tableName}`);
      return { copied: 0, errors: 0 };
    }

    console.log(`   📊 Found ${sourceData.length} records in source`);

    // Clear existing data in target
    const deletedCount = await targetPrisma[tableName].deleteMany({});
    console.log(`   🗑️  Cleared ${deletedCount.count} existing records`);

    // Insert data into target
    const result = await targetPrisma[tableName].createMany({
      data: sourceData,
      skipDuplicates: true
    });

    console.log(`   ✅ Successfully copied ${result.count} records`);
    return { copied: result.count, errors: 0 };

  } catch (error) {
    console.error(`   ❌ Error copying ${tableName}:`, error.message);
    return { copied: 0, errors: 1 };
  }
}

async function copyAllData() {
  console.log('🚀 Starting data copy from saski-ai-website to local database...');
  console.log('📋 Available tables:');
  
  Object.entries(availableTables).forEach(([table, description]) => {
    console.log(`   • ${table}: ${description}`);
  });
  
  try {
    // Test connections
    console.log('\n📡 Testing database connections...');
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');

    let totalCopied = 0;
    let totalErrors = 0;

    // Copy all tables
    for (const tableName of Object.keys(availableTables)) {
      const result = await copyTable(tableName);
      totalCopied += result.copied;
      totalErrors += result.errors;
      console.log(''); // Add spacing between tables
    }

    console.log('📊 Copy Summary:');
    console.log(`   Total records copied: ${totalCopied}`);
    console.log(`   Tables with errors: ${totalErrors}`);
    console.log('✅ Data copy completed!');

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    console.log('🔌 Database connections closed');
  }
}

// Check if specific table is requested
const tableName = process.argv[2];
if (tableName && availableTables[tableName]) {
  console.log(`🎯 Copying specific table: ${tableName}`);
  copyTable(tableName).then(result => {
    console.log(`\n📊 Summary: ${result.copied} records copied, ${result.errors} errors`);
    process.exit(0);
  }).catch(console.error);
} else if (tableName) {
  console.log(`❌ Table "${tableName}" not found. Available tables:`);
  Object.keys(availableTables).forEach(table => console.log(`   • ${table}`));
  process.exit(1);
} else {
  // Copy all data
  copyAllData().catch(console.error);
} 