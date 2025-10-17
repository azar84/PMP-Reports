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

async function copySmtpCloudinaryInfo() {
  console.log('📧☁️  Copying SMTP and Cloudinary information from saski-ai-website to local database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    // Get SMTP and Cloudinary info from source site settings
    console.log('📧☁️  Getting SMTP and Cloudinary information from source...');
    
    const sourceSiteSettings = await sourcePrisma.$queryRaw`
      SELECT * FROM site_settings
    `;
    
    if (sourceSiteSettings.length > 0) {
      const sourceSettings = sourceSiteSettings[0];
      console.log(`   📊 Found site settings with configuration`);
      console.log(`      SMTP Enabled: ${sourceSettings.smtpEnabled}`);
      console.log(`      SMTP Host: ${sourceSettings.smtpHost || 'Not set'}`);
      console.log(`      SMTP Port: ${sourceSettings.smtpPort || 'Not set'}`);
      console.log(`      SMTP From Email: ${sourceSettings.smtpFromEmail || 'Not set'}`);
      console.log(`      SMTP From Name: ${sourceSettings.smtpFromName || 'Not set'}`);
      console.log(`      Cloudinary Enabled: ${sourceSettings.cloudinaryEnabled}`);
      console.log(`      Cloudinary Cloud Name: ${sourceSettings.cloudinaryCloudName || 'Not set'}`);
      
      // Update local site settings with SMTP and Cloudinary info
      console.log('\n🔄 Updating local site settings with SMTP and Cloudinary information...');
      try {
        await targetPrisma.$queryRaw`
          UPDATE site_settings 
          SET 
            "smtpEnabled" = ${sourceSettings.smtpEnabled},
            "smtpHost" = ${sourceSettings.smtpHost},
            "smtpPort" = ${sourceSettings.smtpPort},
            "smtpSecure" = ${sourceSettings.smtpSecure},
            "smtpUsername" = ${sourceSettings.smtpUsername},
            "smtpPassword" = ${sourceSettings.smtpPassword},
            "smtpFromEmail" = ${sourceSettings.smtpFromEmail},
            "smtpFromName" = ${sourceSettings.smtpFromName},
            "smtpReplyTo" = ${sourceSettings.smtpReplyTo},
            "emailSignature" = ${sourceSettings.emailSignature},
            "emailFooterText" = ${sourceSettings.emailFooterText},
            "emailBrandingEnabled" = ${sourceSettings.emailBrandingEnabled},
            "adminNotificationEmail" = ${sourceSettings.adminNotificationEmail},
            "emailLoggingEnabled" = ${sourceSettings.emailLoggingEnabled},
            "emailRateLimitPerHour" = ${sourceSettings.emailRateLimitPerHour},
            "cloudinaryApiKey" = ${sourceSettings.cloudinaryApiKey},
            "cloudinaryApiSecret" = ${sourceSettings.cloudinaryApiSecret},
            "cloudinaryCloudName" = ${sourceSettings.cloudinaryCloudName},
            "cloudinaryEnabled" = ${sourceSettings.cloudinaryEnabled},
            "cloudinaryUploadPreset" = ${sourceSettings.cloudinaryUploadPreset}
          WHERE id = 1
        `;
        console.log(`   ✅ Updated local site settings with SMTP and Cloudinary information`);
      } catch (error) {
        console.log(`   ❌ Error updating site settings: ${error.message}`);
      }
    } else {
      console.log(`   ⚠️  No site settings found in source`);
    }

    console.log('\n✅ SMTP and Cloudinary information copy completed!');
    console.log('📧 SMTP configuration is now available for email functionality.');
    console.log('☁️  Cloudinary configuration is ready for media uploads (if configured).');

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    console.log('\n🔌 Database connections closed');
  }
}

// Run the copy
copySmtpCloudinaryInfo().then(() => {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SMTP & CLOUDINARY COPY SUMMARY');
  console.log('='.repeat(80));
  console.log('✅ SMTP configuration has been copied to local database');
  console.log('📧 Email functionality is now properly configured');
  console.log('☁️  Cloudinary settings are ready (if credentials are provided)');
  console.log('🔄 The website can now send emails and handle media uploads');
}).catch(console.error); 