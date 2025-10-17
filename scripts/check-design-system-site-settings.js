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

async function checkDesignSystemSiteSettings() {
  console.log('🔍 Checking Design System and Site Settings data in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Check Design System data
    const designSystemCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM design_system
    `;
    console.log(`🎨 Design System: ${designSystemCount[0].count} records`);

    // Check Site Settings data
    const siteSettingsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM site_settings
    `;
    console.log(`⚙️  Site Settings: ${siteSettingsCount[0].count} records`);

    if (designSystemCount[0].count > 0) {
      const designSystemData = await sourcePrisma.$queryRaw`
        SELECT * FROM design_system
      `;
      
      console.log('\n🎨 Design System Data:');
      designSystemData.forEach((ds, index) => {
        console.log(`\n   ${index + 1}. Design System ID: ${ds.id}`);
        console.log(`      Primary Color: ${ds.primaryColor || 'No primary color'}`);
        console.log(`      Secondary Color: ${ds.secondaryColor || 'No secondary color'}`);
        console.log(`      Accent Color: ${ds.accentColor || 'No accent color'}`);
        console.log(`      Text Primary: ${ds.textPrimary || 'No text primary'}`);
        console.log(`      Text Secondary: ${ds.textSecondary || 'No text secondary'}`);
        console.log(`      Background Primary: ${ds.backgroundPrimary || 'No background primary'}`);
        console.log(`      Background Secondary: ${ds.backgroundSecondary || 'No background secondary'}`);
        console.log(`      Border Color: ${ds.borderColor || 'No border color'}`);
        console.log(`      Success Color: ${ds.successColor || 'No success color'}`);
        console.log(`      Warning Color: ${ds.warningColor || 'No warning color'}`);
        console.log(`      Error Color: ${ds.errorColor || 'No error color'}`);
        console.log(`      Info Color: ${ds.infoColor || 'No info color'}`);
        console.log(`      Is Active: ${ds.isActive}`);
        console.log(`      Created At: ${ds.createdAt}`);
        console.log(`      Updated At: ${ds.updatedAt}`);
      });
    }

    if (siteSettingsCount[0].count > 0) {
      const siteSettingsData = await sourcePrisma.$queryRaw`
        SELECT * FROM site_settings
      `;
      
      console.log('\n⚙️  Site Settings Data:');
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

    console.log('\n📊 Design System & Site Settings Summary:');
    console.log('─'.repeat(60));
    console.log(`Design System: ${designSystemCount[0].count}`);
    console.log(`Site Settings: ${siteSettingsCount[0].count}`);
    
    if (designSystemCount[0].count > 0 || siteSettingsCount[0].count > 0) {
      console.log('\n✅ Design system and site settings data found! This data needs to be copied.');
    } else {
      console.log('\n⚠️  No design system or site settings data found in saski-ai-website database.');
    }

  } catch (error) {
    console.error('❌ Error checking design system and site settings data:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkDesignSystemSiteSettings().catch(console.error); 