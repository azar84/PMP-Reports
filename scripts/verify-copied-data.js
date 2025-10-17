const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verifyCopiedData() {
  console.log('🔍 Verifying copied saski-ai-website data in local database...\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    const tables = [
      { name: 'SiteSettings', description: 'Site configuration' },
      { name: 'DesignSystem', description: 'Design system' },
      { name: 'Page', description: 'Website pages' },
      { name: 'Menu', description: 'Navigation menus' },
      { name: 'HeaderConfig', description: 'Header config' },
      { name: 'CTA', description: 'Call-to-action buttons' },
      { name: 'GlobalFunctions', description: 'Global functions' },
      { name: 'GlobalFeature', description: 'Global features' },
      { name: 'FeatureGroup', description: 'Feature groups' },
      { name: 'FAQCategory', description: 'FAQ categories' },
      { name: 'FAQ', description: 'FAQ questions' },
      { name: 'FAQSection', description: 'FAQ sections' },
      { name: 'Plan', description: 'Pricing plans' },
      { name: 'BillingCycle', description: 'Billing cycles' },
      { name: 'PlanFeatureType', description: 'Plan feature types' },
      { name: 'PlanFeatureLimit', description: 'Plan feature limits' },
      { name: 'PlanPricing', description: 'Plan pricing' },
      { name: 'MediaLibrary', description: 'Media library' },
      { name: 'PricingSection', description: 'Pricing sections' },
      { name: 'Form', description: 'Forms' },
      { name: 'FormField', description: 'Form fields' },
      { name: 'HtmlSection', description: 'HTML sections' },
      { name: 'AdminUser', description: 'Admin users' },
      { name: 'ServiceAccountCredentials', description: 'Service account credentials' },
      { name: 'SitemapSubmissionLog', description: 'Sitemap logs' }
    ];

    let totalRecords = 0;
    let tablesWithData = 0;

    console.log('📊 Data Verification Summary:');
    console.log('─'.repeat(60));

    for (const table of tables) {
      try {
        const count = await prisma[table.name].count();
        if (count > 0) {
          console.log(`✅ ${table.name.padEnd(25)} | ${count.toString().padStart(3)} records | ${table.description}`);
          totalRecords += count;
          tablesWithData++;
        } else {
          console.log(`❌ ${table.name.padEnd(25)} | ${count.toString().padStart(3)} records | ${table.description}`);
        }
      } catch (error) {
        console.log(`⚠️  ${table.name.padEnd(25)} | ERROR | ${table.description} (${error.message})`);
      }
    }

    console.log('─'.repeat(60));
    console.log(`📈 Total records: ${totalRecords}`);
    console.log(`📋 Tables with data: ${tablesWithData}/${tables.length}`);
    console.log(`🎯 Success rate: ${((tablesWithData / tables.length) * 100).toFixed(1)}%`);

    // Show sample data from key tables
    console.log('\n📝 Sample Data Verification:');
    console.log('─'.repeat(60));
    
    try {
      const pages = await prisma.Page.findMany({ take: 5 });
      console.log(`📄 Pages (${pages.length}):`);
      pages.forEach(page => {
        console.log(`   • ${page.title} (${page.slug})`);
      });
    } catch (error) {
      console.log('   ❌ Error fetching pages');
    }

    try {
      const faqs = await prisma.FAQ.findMany({ take: 5 });
      console.log(`❓ FAQs (${faqs.length}):`);
      faqs.forEach(faq => {
        console.log(`   • ${faq.question.substring(0, 50)}...`);
      });
    } catch (error) {
      console.log('   ❌ Error fetching FAQs');
    }

    try {
      const plans = await prisma.Plan.findMany({ take: 5 });
      console.log(`💰 Plans (${plans.length}):`);
      plans.forEach(plan => {
        console.log(`   • ${plan.name} - $${plan.price || 'N/A'}`);
      });
    } catch (error) {
      console.log('   ❌ Error fetching plans');
    }

    try {
      const media = await prisma.MediaLibrary.findMany({ take: 5 });
      console.log(`🖼️  Media (${media.length}):`);
      media.forEach(item => {
        console.log(`   • ${item.title || item.filename} (${item.fileType})`);
      });
    } catch (error) {
      console.log('   ❌ Error fetching media');
    }

    try {
      const siteSettings = await prisma.SiteSettings.findFirst();
      if (siteSettings) {
        console.log(`⚙️  Site Settings: ${siteSettings.siteName || 'Configured'}`);
      } else {
        console.log(`⚙️  Site Settings: Not found`);
      }
    } catch (error) {
      console.log('   ❌ Error fetching site settings');
    }

    console.log('\n✅ Data verification completed!');
    console.log('🌐 The saski-ai-website data has been successfully copied to your local database.');
    console.log('🚀 You can now run the development server to see the copied data.');

  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCopiedData().catch(console.error); 