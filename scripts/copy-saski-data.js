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

async function copyData() {
  console.log('🚀 Starting data copy from saski-ai-website to local database...');
  
  try {
    // Test connections
    console.log('📡 Testing database connections...');
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');

    // Copy data from various tables
    const tables = [
      'SiteSettings',
      'DesignSystem',
      'Page',
      'HeroSection',
      'Feature',
      'MediaSection',
      'Menu',
      'HeaderConfig',
      'CTA',
      'GlobalFunctions',
      'HomePageHero',
      'TrustIndicator',
      'GlobalFeature',
      'FeatureGroup',
      'FAQCategory',
      'FAQ',
      'FAQSection',
      'ContactSection',
      'ContactField',
      'Plan',
      'BillingCycle',
      'PlanPricing',
      'PlanFeatureType',
      'PlanFeatureLimit',
      'SharedFeature',
      'PlanFeature',
      'MediaLibrary',
      'MediaFolder',
      'PricingSection',
      'Form',
      'FormField',
      'HtmlSection',
      'NewsletterSubscriber',
      'TeamSection',
      'TeamMember',
      'AdminUser',
      'ServiceAccountCredentials',
      'SitemapSubmissionLog'
    ];

    let totalCopied = 0;
    let totalErrors = 0;

    for (const table of tables) {
      try {
        console.log(`📋 Copying ${table}...`);
        
        // Get data from source
        const sourceData = await sourcePrisma[table].findMany();
        
        if (sourceData.length === 0) {
          console.log(`   ⚠️  No data found in ${table}`);
          continue;
        }

        // Clear existing data in target (optional - comment out if you want to keep existing data)
        await targetPrisma[table].deleteMany({});
        console.log(`   🗑️  Cleared existing ${table} data`);

        // Insert data into target
        const result = await targetPrisma[table].createMany({
          data: sourceData,
          skipDuplicates: true
        });

        console.log(`   ✅ Copied ${result.count} records from ${table}`);
        totalCopied += result.count;

      } catch (error) {
        console.error(`   ❌ Error copying ${table}:`, error.message);
        totalErrors++;
      }
    }

    console.log('\n📊 Copy Summary:');
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

// Run the copy
copyData().catch(console.error); 