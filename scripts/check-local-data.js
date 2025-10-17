const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkLocalData() {
  console.log('🔍 Checking local database data after saski-ai-website copy...\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    const tables = [
      { name: 'SiteSettings', description: 'Site configuration' },
      { name: 'DesignSystem', description: 'Design system' },
      { name: 'Page', description: 'Website pages' },
      { name: 'HeroSection', description: 'Hero sections' },
      { name: 'Feature', description: 'Features' },
      { name: 'MediaSection', description: 'Media sections' },
      { name: 'Menu', description: 'Navigation menus' },
      { name: 'HeaderConfig', description: 'Header config' },
      { name: 'CTA', description: 'Call-to-action buttons' },
      { name: 'GlobalFunctions', description: 'Global functions' },
      { name: 'HomePageHero', description: 'Homepage hero' },
      { name: 'TrustIndicator', description: 'Trust indicators' },
      { name: 'GlobalFeature', description: 'Global features' },
      { name: 'FeatureGroup', description: 'Feature groups' },
      { name: 'FAQCategory', description: 'FAQ categories' },
      { name: 'FAQ', description: 'FAQ questions' },
      { name: 'FAQSection', description: 'FAQ sections' },
      { name: 'ContactSection', description: 'Contact sections' },
      { name: 'ContactField', description: 'Contact fields' },
      { name: 'Plan', description: 'Pricing plans' },
      { name: 'BillingCycle', description: 'Billing cycles' },
      { name: 'PlanPricing', description: 'Plan pricing' },
      { name: 'PlanFeatureType', description: 'Plan feature types' },
      { name: 'PlanFeatureLimit', description: 'Plan feature limits' },
      { name: 'SharedFeature', description: 'Shared features' },
      { name: 'PlanFeature', description: 'Plan features' },
      { name: 'MediaLibrary', description: 'Media library' },
      { name: 'MediaFolder', description: 'Media folders' },
      { name: 'PricingSection', description: 'Pricing sections' },
      { name: 'Form', description: 'Forms' },
      { name: 'FormField', description: 'Form fields' },
      { name: 'HtmlSection', description: 'HTML sections' },
      { name: 'NewsletterSubscriber', description: 'Newsletter subscribers' },
      { name: 'TeamSection', description: 'Team sections' },
      { name: 'TeamMember', description: 'Team members' },
      { name: 'AdminUser', description: 'Admin users' },
      { name: 'ServiceAccountCredentials', description: 'Service account credentials' },
      { name: 'SitemapSubmissionLog', description: 'Sitemap logs' }
    ];

    let totalRecords = 0;
    let tablesWithData = 0;

    console.log('📊 Data Summary:');
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

    // Show some sample data
    console.log('\n📝 Sample Data:');
    console.log('─'.repeat(60));
    
    try {
      const pages = await prisma.Page.findMany({ take: 3 });
      console.log(`📄 Pages (${pages.length}):`);
      pages.forEach(page => {
        console.log(`   • ${page.title} (${page.slug})`);
      });
    } catch (error) {
      console.log('   ❌ Error fetching pages');
    }

    try {
      const faqs = await prisma.FAQ.findMany({ take: 3 });
      console.log(`❓ FAQs (${faqs.length}):`);
      faqs.forEach(faq => {
        console.log(`   • ${faq.question.substring(0, 50)}...`);
      });
    } catch (error) {
      console.log('   ❌ Error fetching FAQs');
    }

    try {
      const plans = await prisma.Plan.findMany({ take: 3 });
      console.log(`💰 Plans (${plans.length}):`);
      plans.forEach(plan => {
        console.log(`   • ${plan.name} - $${plan.price}`);
      });
    } catch (error) {
      console.log('   ❌ Error fetching plans');
    }

    console.log('\n✅ Local database is ready with saski-ai-website data!');
    console.log('🌐 You can now run the development server to see the copied data.');

  } catch (error) {
    console.error('❌ Error checking local data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLocalData().catch(console.error); 