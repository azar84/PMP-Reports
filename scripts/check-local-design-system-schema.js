const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkLocalDesignSystemSchema() {
  console.log('🔍 Checking local Design System and Site Settings schema...');
  console.log('='.repeat(80));
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    // Get Design System table structure
    console.log('🎨 Local Design System Table Structure:');
    console.log('─'.repeat(60));
    const designSystemTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'design_system'
      ORDER BY ordinal_position
    `;

    designSystemTableInfo.forEach(column => {
      console.log(`${column.column_name.padEnd(25)} | ${column.data_type.padEnd(15)} | ${column.is_nullable}`);
    });

    // Get Site Settings table structure
    console.log('\n⚙️  Local Site Settings Table Structure:');
    console.log('─'.repeat(60));
    const siteSettingsTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'site_settings'
      ORDER BY ordinal_position
    `;

    siteSettingsTableInfo.forEach(column => {
      console.log(`${column.column_name.padEnd(25)} | ${column.data_type.padEnd(15)} | ${column.is_nullable}`);
    });

    // Get sample data
    console.log('\n📄 Sample Local Design System Data:');
    console.log('─'.repeat(60));
    const sampleDesignSystemData = await prisma.$queryRaw`
      SELECT * FROM design_system LIMIT 1
    `;

    if (sampleDesignSystemData.length > 0) {
      const sample = sampleDesignSystemData[0];
      Object.keys(sample).forEach(key => {
        console.log(`${key.padEnd(25)} | ${String(sample[key]).substring(0, 50)}`);
      });
    } else {
      console.log('No design system data found in local database');
    }

    console.log('\n📄 Sample Local Site Settings Data:');
    console.log('─'.repeat(60));
    const sampleSiteSettingsData = await prisma.$queryRaw`
      SELECT * FROM site_settings LIMIT 1
    `;

    if (sampleSiteSettingsData.length > 0) {
      const sample = sampleSiteSettingsData[0];
      Object.keys(sample).forEach(key => {
        console.log(`${key.padEnd(25)} | ${String(sample[key]).substring(0, 50)}`);
      });
    } else {
      console.log('No site settings data found in local database');
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkLocalDesignSystemSchema().catch(console.error); 