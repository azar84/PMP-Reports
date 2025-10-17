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

async function checkCompanyData() {
  console.log('🔍 Checking Company Information data in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Check Site Settings data (which contains company info)
    const siteSettingsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM site_settings
    `;
    console.log(`⚙️  Site Settings: ${siteSettingsCount[0].count} records`);

    // Check for any other company-related tables
    const tables = await sourcePrisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND (table_name ILIKE '%company%' OR table_name ILIKE '%contact%' OR table_name ILIKE '%business%')
      ORDER BY table_name
    `;

    console.log('\n🏢 Company-related Tables:');
    console.log('─'.repeat(60));
    if (tables.length > 0) {
      tables.forEach((table, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${table.table_name}`);
      });
    } else {
      console.log('No specific company tables found');
    }

    if (siteSettingsCount[0].count > 0) {
      const siteSettingsData = await sourcePrisma.$queryRaw`
        SELECT * FROM site_settings
      `;
      
      console.log('\n🏢 Company Information from Site Settings:');
      siteSettingsData.forEach((settings, index) => {
        console.log(`\n   ${index + 1}. Site Settings ID: ${settings.id}`);
        console.log(`      Site Name: ${settings.siteName || 'No site name'}`);
        console.log(`      Site Description: ${settings.siteDescription || 'No description'}`);
        console.log(`      Site URL: ${settings.siteUrl || 'No URL'}`);
        console.log(`      Logo URL: ${settings.logoUrl || 'No logo'}`);
        console.log(`      Favicon URL: ${settings.faviconUrl || 'No favicon'}`);
        console.log(`      Meta Title: ${settings.metaTitle || 'No meta title'}`);
        console.log(`      Meta Description: ${settings.metaDescription || 'No meta description'}`);
        console.log(`      Meta Keywords: ${settings.metaKeywords || 'No meta keywords'}`);
        console.log(`      Google Analytics ID: ${settings.googleAnalyticsId || 'No GA ID'}`);
        console.log(`      Google Tag Manager ID: ${settings.googleTagManagerId || 'No GTM ID'}`);
        console.log(`      Facebook Pixel ID: ${settings.facebookPixelId || 'No FB Pixel'}`);
        console.log(`      Contact Email: ${settings.contactEmail || 'No contact email'}`);
        console.log(`      Contact Phone: ${settings.contactPhone || 'No contact phone'}`);
        console.log(`      Contact Address: ${settings.contactAddress || 'No contact address'}`);
        console.log(`      Social Media: ${settings.socialMedia ? JSON.stringify(settings.socialMedia).substring(0, 100) + '...' : 'No social media'}`);
        console.log(`      Is Active: ${settings.isActive}`);
        console.log(`      Created At: ${settings.createdAt}`);
        console.log(`      Updated At: ${settings.updatedAt}`);
      });
    }

    // Check for testimonials (might contain company info)
    const testimonialsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM testimonials
    `;
    console.log(`\n💬 Testimonials: ${testimonialsCount[0].count} records`);

    if (testimonialsCount[0].count > 0) {
      const testimonialsData = await sourcePrisma.$queryRaw`
        SELECT * FROM testimonials LIMIT 3
      `;
      
      console.log('\n💬 Sample Testimonials (Company References):');
      testimonialsData.forEach((testimonial, index) => {
        console.log(`\n   ${index + 1}. Testimonial ID: ${testimonial.id}`);
        console.log(`      Author: ${testimonial.author || 'No author'}`);
        console.log(`      Company: ${testimonial.company || 'No company'}`);
        console.log(`      Content: ${testimonial.content ? testimonial.content.substring(0, 100) + '...' : 'No content'}`);
        console.log(`      Rating: ${testimonial.rating || 'No rating'}`);
        console.log(`      Is Active: ${testimonial.isActive}`);
      });
    }

    // Check for trust indicators (company credibility)
    const trustIndicatorsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM trust_indicators
    `;
    console.log(`\n🛡️  Trust Indicators: ${trustIndicatorsCount[0].count} records`);

    if (trustIndicatorsCount[0].count > 0) {
      const trustIndicatorsData = await sourcePrisma.$queryRaw`
        SELECT * FROM trust_indicators
      `;
      
      console.log('\n🛡️  Trust Indicators (Company Credibility):');
      trustIndicatorsData.forEach((indicator, index) => {
        console.log(`\n   ${index + 1}. Trust Indicator ID: ${indicator.id}`);
        console.log(`      Title: ${indicator.title || 'No title'}`);
        console.log(`      Description: ${indicator.description || 'No description'}`);
        console.log(`      Icon: ${indicator.icon || 'No icon'}`);
        console.log(`      Value: ${indicator.value || 'No value'}`);
        console.log(`      Is Active: ${indicator.isActive}`);
      });
    }

    console.log('\n📊 Company Information Summary:');
    console.log('─'.repeat(60));
    console.log(`Site Settings: ${siteSettingsCount[0].count}`);
    console.log(`Testimonials: ${testimonialsCount[0].count}`);
    console.log(`Trust Indicators: ${trustIndicatorsCount[0].count}`);
    
    if (siteSettingsCount[0].count > 0 || testimonialsCount[0].count > 0 || trustIndicatorsCount[0].count > 0) {
      console.log('\n✅ Company information data found! This data needs to be copied.');
    } else {
      console.log('\n⚠️  No company information data found in saski-ai-website database.');
    }

  } catch (error) {
    console.error('❌ Error checking company data:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkCompanyData().catch(console.error); 