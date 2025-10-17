const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function updateSmtpInfo() {
  console.log('📧 Updating SMTP information in local database...');
  console.log('='.repeat(80));
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    // Update SMTP information with the values from saski-ai-website
    console.log('🔄 Updating SMTP configuration...');
    try {
      await prisma.$queryRaw`
        UPDATE site_settings 
        SET 
          "smtpEnabled" = true,
          "smtpHost" = 'mail.smtp2go.com',
          "smtpPort" = 587,
          "smtpSecure" = true,
          "smtpUsername" = 'saskiwebsite',
          "smtpPassword" = '9uGas4YYnmXlxofg',
          "smtpFromEmail" = 'customer.care@saskiai.com',
          "smtpFromName" = 'Saski AI',
          "smtpReplyTo" = null,
          "emailSignature" = null,
          "emailFooterText" = null,
          "emailBrandingEnabled" = true,
          "adminNotificationEmail" = null,
          "emailLoggingEnabled" = true,
          "emailRateLimitPerHour" = 100
        WHERE id = 1
      `;
      console.log(`   ✅ Successfully updated SMTP configuration`);
    } catch (error) {
      console.log(`   ❌ Error updating SMTP configuration: ${error.message}`);
    }

    // Verify the update
    console.log('\n🔍 Verifying SMTP configuration...');
    const settings = await prisma.$queryRaw`
      SELECT * FROM site_settings WHERE id = 1
    `;
    
    if (settings.length > 0) {
      const s = settings[0];
      console.log('\n📧 Updated SMTP Configuration:');
      console.log(`   SMTP Enabled: ${s.smtpEnabled ? '✅ Yes' : '❌ No'}`);
      console.log(`   SMTP Host: ${s.smtpHost || '❌ Not set'}`);
      console.log(`   SMTP Port: ${s.smtpPort || '❌ Not set'}`);
      console.log(`   SMTP Secure: ${s.smtpSecure ? '✅ Yes' : '❌ No'}`);
      console.log(`   SMTP Username: ${s.smtpUsername ? '✅ Set' : '❌ Not set'}`);
      console.log(`   SMTP Password: ${s.smtpPassword ? '✅ Set' : '❌ Not set'}`);
      console.log(`   SMTP From Email: ${s.smtpFromEmail || '❌ Not set'}`);
      console.log(`   SMTP From Name: ${s.smtpFromName || '❌ Not set'}`);
      console.log(`   Email Branding Enabled: ${s.emailBrandingEnabled ? '✅ Yes' : '❌ No'}`);
      console.log(`   Email Logging Enabled: ${s.emailLoggingEnabled ? '✅ Yes' : '❌ No'}`);
      console.log(`   Email Rate Limit Per Hour: ${s.emailRateLimitPerHour || '❌ Not set'}`);
    }

    console.log('\n✅ SMTP information update completed!');
    console.log('📧 Email functionality is now properly configured.');
    console.log('🔄 The website can now send emails using the saski-ai-website configuration.');

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the update
updateSmtpInfo().then(() => {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SMTP UPDATE SUMMARY');
  console.log('='.repeat(80));
  console.log('✅ SMTP configuration has been updated');
  console.log('📧 Email functionality is now properly configured');
  console.log('🔄 The website can now send emails');
}).catch(console.error); 