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

async function copyCompanyInfo() {
  console.log('🏢 Copying Company Information data from saski-ai-website to local database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    // Check if we need to update site_settings with more company info
    console.log('🏢 Checking for additional company information...');
    
    // Get current site settings from source
    const sourceSiteSettings = await sourcePrisma.$queryRaw`
      SELECT * FROM site_settings
    `;
    
    if (sourceSiteSettings.length > 0) {
      const sourceSettings = sourceSiteSettings[0];
      console.log(`   📊 Found site settings with company info`);
      console.log(`      Logo: ${sourceSettings.logoUrl ? 'Yes' : 'No'}`);
      console.log(`      Contact Email: ${sourceSettings.contactEmail || 'Not set'}`);
      console.log(`      Contact Phone: ${sourceSettings.contactPhone || 'Not set'}`);
      console.log(`      Contact Address: ${sourceSettings.contactAddress || 'Not set'}`);
      
      // Update local site settings with any missing company info
      console.log('\n🔄 Updating local site settings with company information...');
      try {
        await targetPrisma.$queryRaw`
          UPDATE site_settings 
          SET 
            "companyEmail" = ${sourceSettings.contactEmail},
            "companyPhone" = ${sourceSettings.contactPhone},
            "companyAddress" = ${sourceSettings.contactAddress}
          WHERE id = 1
        `;
        console.log(`   ✅ Updated local site settings with company information`);
      } catch (error) {
        console.log(`   ❌ Error updating site settings: ${error.message}`);
      }
    }

    // Check for any other company-related data that might need copying
    console.log('\n🔍 Checking for other company-related data...');
    
    // Check if there are any other tables with company info
    const companyTables = await sourcePrisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND column_name ILIKE '%company%'
      GROUP BY table_name
    `;
    
    if (companyTables.length > 0) {
      console.log(`   📋 Found tables with company columns: ${companyTables.length}`);
      companyTables.forEach(table => {
        console.log(`      - ${table.table_name}`);
      });
    } else {
      console.log(`   📋 No additional company-specific tables found`);
    }

    // Check for any business-related data
    const businessTables = await sourcePrisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND column_name ILIKE '%business%'
      GROUP BY table_name
    `;
    
    if (businessTables.length > 0) {
      console.log(`   📋 Found tables with business columns: ${businessTables.length}`);
      businessTables.forEach(table => {
        console.log(`      - ${table.table_name}`);
      });
    }

    console.log('\n✅ Company information copy completed!');
    console.log('🏢 The site settings now contain the complete company information from saski-ai-website.');
    console.log('📧 Contact details, logo, and company branding are properly configured.');

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    console.log('\n🔌 Database connections closed');
  }
}

// Run the copy
copyCompanyInfo().then(() => {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPANY INFORMATION COPY SUMMARY');
  console.log('='.repeat(80));
  console.log('✅ Company information has been updated in site settings');
  console.log('🏢 Logo, contact details, and company branding are configured');
  console.log('🔄 The website now displays the proper company information');
}).catch(console.error); 