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

async function checkContactData() {
  console.log('🔍 Checking Contact-related data in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Check Contact Email Settings
    const contactEmailSettingsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM contact_email_settings
    `;
    console.log(`📧 Contact Email Settings: ${contactEmailSettingsCount[0].count} records`);

    // Check Contact Fields
    const contactFieldsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM contact_fields
    `;
    console.log(`📝 Contact Fields: ${contactFieldsCount[0].count} records`);

    // Check Contact Sections
    const contactSectionsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM contact_sections
    `;
    console.log(`📞 Contact Sections: ${contactSectionsCount[0].count} records`);

    // Check Contact Submissions
    const contactSubmissionsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM contact_submissions
    `;
    console.log(`📨 Contact Submissions: ${contactSubmissionsCount[0].count} records`);

    if (contactEmailSettingsCount[0].count > 0) {
      const contactEmailSettingsData = await sourcePrisma.$queryRaw`
        SELECT * FROM contact_email_settings
      `;
      
      console.log('\n📧 Contact Email Settings:');
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
    }

    if (contactFieldsCount[0].count > 0) {
      const contactFieldsData = await sourcePrisma.$queryRaw`
        SELECT * FROM contact_fields
      `;
      
      console.log('\n📝 Contact Fields:');
      contactFieldsData.forEach((field, index) => {
        console.log(`\n   ${index + 1}. Contact Field ID: ${field.id}`);
        console.log(`      Name: ${field.name || 'No name'}`);
        console.log(`      Label: ${field.label || 'No label'}`);
        console.log(`      Type: ${field.type || 'No type'}`);
        console.log(`      Required: ${field.required}`);
        console.log(`      Placeholder: ${field.placeholder || 'No placeholder'}`);
        console.log(`      Order: ${field.order || 'No order'}`);
        console.log(`      Is Active: ${field.isActive}`);
        console.log(`      Created At: ${field.createdAt}`);
        console.log(`      Updated At: ${field.updatedAt}`);
      });
    }

    if (contactSectionsCount[0].count > 0) {
      const contactSectionsData = await sourcePrisma.$queryRaw`
        SELECT * FROM contact_sections
      `;
      
      console.log('\n📞 Contact Sections:');
      contactSectionsData.forEach((section, index) => {
        console.log(`\n   ${index + 1}. Contact Section ID: ${section.id}`);
        console.log(`      Title: ${section.title || 'No title'}`);
        console.log(`      Description: ${section.description || 'No description'}`);
        console.log(`      Email: ${section.email || 'No email'}`);
        console.log(`      Phone: ${section.phone || 'No phone'}`);
        console.log(`      Address: ${section.address || 'No address'}`);
        console.log(`      Map URL: ${section.mapUrl || 'No map URL'}`);
        console.log(`      Is Active: ${section.isActive}`);
        console.log(`      Created At: ${section.createdAt}`);
        console.log(`      Updated At: ${section.updatedAt}`);
      });
    }

    if (contactSubmissionsCount[0].count > 0) {
      const contactSubmissionsData = await sourcePrisma.$queryRaw`
        SELECT * FROM contact_submissions LIMIT 3
      `;
      
      console.log('\n📨 Sample Contact Submissions:');
      contactSubmissionsData.forEach((submission, index) => {
        console.log(`\n   ${index + 1}. Contact Submission ID: ${submission.id}`);
        console.log(`      Name: ${submission.name || 'No name'}`);
        console.log(`      Email: ${submission.email || 'No email'}`);
        console.log(`      Phone: ${submission.phone || 'No phone'}`);
        console.log(`      Company: ${submission.company || 'No company'}`);
        console.log(`      Message: ${submission.message ? submission.message.substring(0, 100) + '...' : 'No message'}`);
        console.log(`      Status: ${submission.status || 'No status'}`);
        console.log(`      Created At: ${submission.createdAt}`);
      });
    }

    console.log('\n📊 Contact Data Summary:');
    console.log('─'.repeat(60));
    console.log(`Contact Email Settings: ${contactEmailSettingsCount[0].count}`);
    console.log(`Contact Fields: ${contactFieldsCount[0].count}`);
    console.log(`Contact Sections: ${contactSectionsCount[0].count}`);
    console.log(`Contact Submissions: ${contactSubmissionsCount[0].count}`);
    
    if (contactEmailSettingsCount[0].count > 0 || contactFieldsCount[0].count > 0 || contactSectionsCount[0].count > 0) {
      console.log('\n✅ Contact-related company data found! This data needs to be copied.');
    } else {
      console.log('\n⚠️  No contact-related company data found in saski-ai-website database.');
    }

  } catch (error) {
    console.error('❌ Error checking contact data:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkContactData().catch(console.error); 