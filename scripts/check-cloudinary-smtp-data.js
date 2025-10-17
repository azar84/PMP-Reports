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

async function checkCloudinarySmtpData() {
  console.log('🔍 Checking Cloudinary and SMTP information in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Check Site Settings for Cloudinary and SMTP info
    const siteSettingsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM site_settings
    `;
    console.log(`⚙️  Site Settings: ${siteSettingsCount[0].count} records`);

    if (siteSettingsCount[0].count > 0) {
      const siteSettingsData = await sourcePrisma.$queryRaw`
        SELECT * FROM site_settings
      `;
      
      console.log('\n☁️  Cloudinary Information from Site Settings:');
      siteSettingsData.forEach((settings, index) => {
        console.log(`\n   ${index + 1}. Site Settings ID: ${settings.id}`);
        console.log(`      Cloudinary API Key: ${settings.cloudinaryApiKey ? 'Set' : 'Not set'}`);
        console.log(`      Cloudinary API Secret: ${settings.cloudinaryApiSecret ? 'Set' : 'Not set'}`);
        console.log(`      Cloudinary Cloud Name: ${settings.cloudinaryCloudName || 'Not set'}`);
        console.log(`      Cloudinary Enabled: ${settings.cloudinaryEnabled}`);
        console.log(`      Cloudinary Upload Preset: ${settings.cloudinaryUploadPreset || 'Not set'}`);
      });

      console.log('\n📧 SMTP Information from Site Settings:');
      siteSettingsData.forEach((settings, index) => {
        console.log(`\n   ${index + 1}. Site Settings ID: ${settings.id}`);
        console.log(`      SMTP Enabled: ${settings.smtpEnabled}`);
        console.log(`      SMTP Host: ${settings.smtpHost || 'Not set'}`);
        console.log(`      SMTP Port: ${settings.smtpPort || 'Not set'}`);
        console.log(`      SMTP Secure: ${settings.smtpSecure}`);
        console.log(`      SMTP Username: ${settings.smtpUsername ? 'Set' : 'Not set'}`);
        console.log(`      SMTP Password: ${settings.smtpPassword ? 'Set' : 'Not set'}`);
        console.log(`      SMTP From Email: ${settings.smtpFromEmail || 'Not set'}`);
        console.log(`      SMTP From Name: ${settings.smtpFromName || 'Not set'}`);
        console.log(`      SMTP Reply To: ${settings.smtpReplyTo || 'Not set'}`);
        console.log(`      Email Signature: ${settings.emailSignature || 'Not set'}`);
        console.log(`      Email Footer Text: ${settings.emailFooterText || 'Not set'}`);
        console.log(`      Email Branding Enabled: ${settings.emailBrandingEnabled}`);
        console.log(`      Admin Notification Email: ${settings.adminNotificationEmail || 'Not set'}`);
        console.log(`      Email Logging Enabled: ${settings.emailLoggingEnabled}`);
        console.log(`      Email Rate Limit Per Hour: ${settings.emailRateLimitPerHour || 'Not set'}`);
      });
    }

    // Check for any other email-related tables
    const emailTables = await sourcePrisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND (table_name ILIKE '%email%' OR table_name ILIKE '%smtp%' OR table_name ILIKE '%mail%')
      ORDER BY table_name
    `;

    console.log('\n📧 Email-related Tables:');
    console.log('─'.repeat(60));
    if (emailTables.length > 0) {
      emailTables.forEach((table, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${table.table_name}`);
      });
    } else {
      console.log('No specific email tables found');
    }

    // Check for any cloudinary-related tables
    const cloudinaryTables = await sourcePrisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name ILIKE '%cloudinary%'
      ORDER BY table_name
    `;

    console.log('\n☁️  Cloudinary-related Tables:');
    console.log('─'.repeat(60));
    if (cloudinaryTables.length > 0) {
      cloudinaryTables.forEach((table, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${table.table_name}`);
      });
    } else {
      console.log('No specific cloudinary tables found');
    }

    console.log('\n📊 Cloudinary & SMTP Summary:');
    console.log('─'.repeat(60));
    console.log(`Site Settings: ${siteSettingsCount[0].count}`);
    console.log(`Email-related Tables: ${emailTables.length}`);
    console.log(`Cloudinary-related Tables: ${cloudinaryTables.length}`);
    
    if (siteSettingsCount[0].count > 0) {
      console.log('\n✅ Cloudinary and SMTP information found in site settings!');
      console.log('☁️  Cloudinary configuration is available for media uploads.');
      console.log('📧 SMTP configuration is available for email functionality.');
    } else {
      console.log('\n⚠️  No Cloudinary or SMTP information found in saski-ai-website database.');
    }

  } catch (error) {
    console.error('❌ Error checking Cloudinary and SMTP data:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkCloudinarySmtpData().catch(console.error); 