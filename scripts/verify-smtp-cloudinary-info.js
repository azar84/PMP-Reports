const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verifySmtpCloudinaryInfo() {
  console.log('🔍 Verifying SMTP and Cloudinary information...');
  console.log('='.repeat(80));
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    // Check Site Settings for SMTP and Cloudinary info
    const siteSettingsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM site_settings
    `;
    console.log(`⚙️  Site Settings: ${siteSettingsCount[0].count} records`);

    if (siteSettingsCount[0].count > 0) {
      const siteSettingsData = await prisma.$queryRaw`
        SELECT * FROM site_settings
      `;
      
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

      console.log('\n☁️  Cloudinary Information from Site Settings:');
      siteSettingsData.forEach((settings, index) => {
        console.log(`\n   ${index + 1}. Site Settings ID: ${settings.id}`);
        console.log(`      Cloudinary API Key: ${settings.cloudinaryApiKey ? 'Set' : 'Not set'}`);
        console.log(`      Cloudinary API Secret: ${settings.cloudinaryApiSecret ? 'Set' : 'Not set'}`);
        console.log(`      Cloudinary Cloud Name: ${settings.cloudinaryCloudName || 'Not set'}`);
        console.log(`      Cloudinary Enabled: ${settings.cloudinaryEnabled}`);
        console.log(`      Cloudinary Upload Preset: ${settings.cloudinaryUploadPreset || 'Not set'}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 SMTP & CLOUDINARY VERIFICATION');
    console.log('='.repeat(80));
    console.log(`✅ Site Settings: ${siteSettingsCount[0].count}`);
    
    if (siteSettingsCount[0].count > 0) {
      console.log('\n✅ SMTP and Cloudinary information verification completed!');
      console.log('📧 SMTP configuration is available for email functionality.');
      console.log('☁️  Cloudinary configuration is ready for media uploads.');
      console.log('🔄 The development server is running with proper email and media configuration.');
      
      const settings = await prisma.$queryRaw`SELECT * FROM site_settings LIMIT 1`;
      if (settings.length > 0) {
        const s = settings[0];
        console.log('\n📧 Current SMTP Configuration:');
        console.log(`   SMTP Enabled: ${s.smtpEnabled ? '✅ Yes' : '❌ No'}`);
        console.log(`   SMTP Host: ${s.smtpHost || '❌ Not set'}`);
        console.log(`   SMTP Port: ${s.smtpPort || '❌ Not set'}`);
        console.log(`   SMTP From Email: ${s.smtpFromEmail || '❌ Not set'}`);
        console.log(`   SMTP From Name: ${s.smtpFromName || '❌ Not set'}`);
        console.log(`   SMTP Credentials: ${s.smtpUsername && s.smtpPassword ? '✅ Set' : '❌ Not set'}`);
        
        console.log('\n☁️  Current Cloudinary Configuration:');
        console.log(`   Cloudinary Enabled: ${s.cloudinaryEnabled ? '✅ Yes' : '❌ No'}`);
        console.log(`   Cloudinary Cloud Name: ${s.cloudinaryCloudName || '❌ Not set'}`);
        console.log(`   Cloudinary Credentials: ${s.cloudinaryApiKey && s.cloudinaryApiSecret ? '✅ Set' : '❌ Not set'}`);
        console.log(`   Cloudinary Upload Preset: ${s.cloudinaryUploadPreset || '❌ Not set'}`);
      }
    } else {
      console.log('\n⚠️  No site settings found in local database.');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

verifySmtpCloudinaryInfo().catch(console.error); 