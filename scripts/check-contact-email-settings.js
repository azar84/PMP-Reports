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

async function checkContactEmailSettings() {
  console.log('🔍 Checking Contact Email Settings in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Check Contact Email Settings
    const contactEmailSettingsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM contact_email_settings
    `;
    console.log(`📧 Contact Email Settings: ${contactEmailSettingsCount[0].count} records`);

    if (contactEmailSettingsCount[0].count > 0) {
      const contactEmailSettingsData = await sourcePrisma.$queryRaw`
        SELECT * FROM contact_email_settings
      `;
      
      console.log('\n📧 Contact Email Settings Data:');
      contactEmailSettingsData.forEach((settings, index) => {
        console.log(`\n   ${index + 1}. Contact Email Settings ID: ${settings.id}`);
        console.log(`      From Email: ${settings.fromEmail || 'No from email'}`);
        console.log(`      From Name: ${settings.fromName || 'No from name'}`);
        console.log(`      Reply To: ${settings.replyTo || 'No reply to'}`);
        console.log(`      Subject: ${settings.subject || 'No subject'}`);
        console.log(`      Template: ${settings.template || 'No template'}`);
        console.log(`      Is Active: ${settings.isActive}`);
        console.log(`      Created At: ${settings.createdAt}`);
        console.log(`      Updated At: ${settings.updatedAt}`);
      });
    } else {
      console.log('\n📧 No contact email settings found');
    }

    console.log('\n📊 Email Configuration Summary:');
    console.log('─'.repeat(60));
    console.log(`Contact Email Settings: ${contactEmailSettingsCount[0].count}`);
    
    if (contactEmailSettingsCount[0].count > 0) {
      console.log('\n✅ Contact email settings found! This data needs to be copied.');
    } else {
      console.log('\n⚠️  No contact email settings found in saski-ai-website database.');
    }

  } catch (error) {
    console.error('❌ Error checking contact email settings:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkContactEmailSettings().catch(console.error); 