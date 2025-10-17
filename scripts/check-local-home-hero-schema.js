const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkLocalHomeHeroSchema() {
  console.log('🔍 Checking local Home Page Hero schema...');
  console.log('='.repeat(80));
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    // Get table structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'home_page_hero'
      ORDER BY ordinal_position
    `;

    console.log('📋 Local Home Page Hero Table Structure:');
    console.log('─'.repeat(60));
    tableInfo.forEach(column => {
      console.log(`${column.column_name.padEnd(25)} | ${column.data_type.padEnd(15)} | ${column.is_nullable}`);
    });

    // Get sample data
    console.log('\n📄 Sample Local Home Page Hero Data:');
    console.log('─'.repeat(60));
    const sampleData = await prisma.$queryRaw`
      SELECT * FROM home_page_hero LIMIT 1
    `;

    if (sampleData.length > 0) {
      const sample = sampleData[0];
      Object.keys(sample).forEach(key => {
        console.log(`${key.padEnd(25)} | ${String(sample[key]).substring(0, 50)}`);
      });
    } else {
      console.log('No home page hero data found in local database');
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkLocalHomeHeroSchema().catch(console.error); 