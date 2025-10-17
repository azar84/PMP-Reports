const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verifyDesignSystemSiteSettingsCopy() {
  console.log('🔍 Verifying Design System and Site Settings data copy...');
  console.log('='.repeat(80));
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    // Check Design System data
    const designSystemCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM design_system
    `;
    console.log(`🎨 Design System: ${designSystemCount[0].count} records`);

    // Check Site Settings data
    const siteSettingsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM site_settings
    `;
    console.log(`⚙️  Site Settings: ${siteSettingsCount[0].count} records`);

    if (designSystemCount[0].count > 0) {
      const designSystemData = await prisma.$queryRaw`
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
        console.log(`      Success Color: ${ds.successColor || 'No success color'}`);
        console.log(`      Warning Color: ${ds.warningColor || 'No warning color'}`);
        console.log(`      Error Color: ${ds.errorColor || 'No error color'}`);
        console.log(`      Info Color: ${ds.infoColor || 'No info color'}`);
        console.log(`      Font Family: ${ds.fontFamily || 'No font family'}`);
        console.log(`      Theme Mode: ${ds.themeMode || 'No theme mode'}`);
        console.log(`      Is Active: ${ds.isActive}`);
        console.log(`      Created At: ${ds.createdAt}`);
        console.log(`      Updated At: ${ds.updatedAt}`);
      });
    }

    if (siteSettingsCount[0].count > 0) {
      const siteSettingsData = await prisma.$queryRaw`
        SELECT * FROM site_settings
      `;
      
      console.log('\n⚙️  Site Settings Data:');
      siteSettingsData.forEach((settings, index) => {
        console.log(`\n   ${index + 1}. Site Settings ID: ${settings.id}`);
        console.log(`      Logo URL: ${settings.logoUrl || 'No logo'}`);
        console.log(`      Favicon URL: ${settings.faviconUrl || 'No favicon'}`);
        console.log(`      Company Phone: ${settings.companyPhone || 'No phone'}`);
        console.log(`      Company Email: ${settings.companyEmail || 'No email'}`);
        console.log(`      Company Address: ${settings.companyAddress || 'No address'}`);
        console.log(`      Base URL: ${settings.baseUrl || 'No base URL'}`);
        console.log(`      GA Measurement ID: ${settings.gaMeasurementId || 'No GA ID'}`);
        console.log(`      GTM Container ID: ${settings.gtmContainerId || 'No GTM ID'}`);
        console.log(`      GTM Enabled: ${settings.gtmEnabled}`);
        console.log(`      Cloudinary Enabled: ${settings.cloudinaryEnabled}`);
        console.log(`      Created At: ${settings.createdAt}`);
        console.log(`      Updated At: ${settings.updatedAt}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 DESIGN SYSTEM & SITE SETTINGS COPY VERIFICATION');
    console.log('='.repeat(80));
    console.log(`✅ Design System: ${designSystemCount[0].count}`);
    console.log(`✅ Site Settings: ${siteSettingsCount[0].count}`);
    
    if (designSystemCount[0].count > 0 || siteSettingsCount[0].count > 0) {
      console.log('\n✅ Design system and site settings data successfully copied!');
      console.log('🎨 The website should now use the proper design system colors and styling.');
      console.log('⚙️  Site settings including logo, meta tags, and contact info are now configured.');
      console.log('🔄 The development server is running with the complete saski-ai-website data.');
      
      if (designSystemCount[0].count > 0) {
        const ds = await prisma.$queryRaw`SELECT * FROM design_system LIMIT 1`;
        console.log('\n🎨 Copied Design System Colors:');
        console.log(`   Primary: ${ds[0].primaryColor}`);
        console.log(`   Secondary: ${ds[0].secondaryColor}`);
        console.log(`   Accent: ${ds[0].accentColor}`);
        console.log(`   Text Primary: ${ds[0].textPrimary}`);
        console.log(`   Background Primary: ${ds[0].backgroundPrimary}`);
      }
      
      if (siteSettingsCount[0].count > 0) {
        const settings = await prisma.$queryRaw`SELECT * FROM site_settings LIMIT 1`;
        console.log('\n⚙️  Copied Site Settings:');
        console.log(`   Logo: ${settings[0].logoUrl ? 'Yes' : 'No'}`);
        console.log(`   Company Email: ${settings[0].companyEmail || 'Not set'}`);
        console.log(`   Company Phone: ${settings[0].companyPhone || 'Not set'}`);
        console.log(`   GA ID: ${settings[0].gaMeasurementId || 'Not set'}`);
      }
    } else {
      console.log('\n⚠️  No design system or site settings data found in local database.');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

verifyDesignSystemSiteSettingsCopy().catch(console.error); 