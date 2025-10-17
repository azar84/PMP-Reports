const { PrismaClient } = require('@prisma/client');
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

async function clearAndCopyData() {
  console.log('🧹 Clearing local database completely...');
  
  try {
    // Test connections
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');

    // Clear ALL data from local database
    console.log('\n🗑️  Clearing all data from local database...');
    
    const tablesToClear = [
      'SitemapSubmissionLog',
      'ServiceAccountCredentials',
      'AdminUser',
      'TeamMember',
      'TeamSection',
      'NewsletterSubscriber',
      'HtmlSection',
      'FormField',
      'Form',
      'PricingSection',
      'MediaFolder',
      'MediaLibrary',
      'PlanFeature',
      'SharedFeature',
      'PlanFeatureLimit',
      'PlanFeatureType',
      'PlanPricing',
      'BillingCycle',
      'Plan',
      'ContactField',
      'ContactSection',
      'FAQSection',
      'FAQ',
      'FAQCategory',
      'FeatureGroup',
      'GlobalFeature',
      'TrustIndicator',
      'HomePageHero',
      'GlobalFunctions',
      'CTA',
      'HeaderConfig',
      'Menu',
      'MediaSection',
      'Feature',
      'HeroSection',
      'Page',
      'DesignSystem',
      'SiteSettings'
    ];

    for (const table of tablesToClear) {
      try {
        const deletedCount = await targetPrisma[table].deleteMany({});
        console.log(`   🗑️  Cleared ${deletedCount.count} records from ${table}`);
      } catch (error) {
        console.log(`   ⚠️  Could not clear ${table}: ${error.message}`);
      }
    }

    console.log('\n📋 Copying saski-ai-website data...');

    // Copy data from saski-ai-website
    const tablesToCopy = [
      'SiteSettings',
      'DesignSystem',
      'Page',
      'Menu',
      'HeaderConfig',
      'CTA',
      'GlobalFunctions',
      'GlobalFeature',
      'FeatureGroup',
      'FAQCategory',
      'FAQ',
      'FAQSection',
      'Plan',
      'BillingCycle',
      'PlanPricing',
      'PlanFeatureType',
      'PlanFeatureLimit',
      'MediaLibrary',
      'PricingSection',
      'Form',
      'FormField',
      'HtmlSection',
      'AdminUser',
      'ServiceAccountCredentials',
      'SitemapSubmissionLog'
    ];

    let totalCopied = 0;
    let totalErrors = 0;

    for (const table of tablesToCopy) {
      try {
        console.log(`📋 Copying ${table}...`);
        
        // Get data from source
        const sourceData = await sourcePrisma[table].findMany();
        
        if (sourceData.length === 0) {
          console.log(`   ⚠️  No data found in ${table}`);
          continue;
        }

        console.log(`   📊 Found ${sourceData.length} records in source`);

        // Insert data into target
        const result = await targetPrisma[table].createMany({
          data: sourceData,
          skipDuplicates: true
        });

        console.log(`   ✅ Successfully copied ${result.count} records`);
        totalCopied += result.count;

      } catch (error) {
        console.error(`   ❌ Error copying ${table}:`, error.message);
        totalErrors++;
      }
    }

    console.log('\n📊 Copy Summary:');
    console.log(`   Total records copied: ${totalCopied}`);
    console.log(`   Tables with errors: ${totalErrors}`);
    console.log('✅ Database cleared and saski-ai-website data copied!');

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    console.log('🔌 Database connections closed');
  }
}

// Run the clear and copy
clearAndCopyData().catch(console.error); 