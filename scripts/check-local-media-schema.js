const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkLocalMediaSchema() {
  console.log('🔍 Checking local MediaSection schema...');
  console.log('='.repeat(80));
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    // Get table structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'media_sections'
      ORDER BY ordinal_position
    `;

    console.log('📋 Local Media Sections Table Structure:');
    console.log('─'.repeat(60));
    tableInfo.forEach(column => {
      console.log(`${column.column_name.padEnd(25)} | ${column.data_type.padEnd(15)} | ${column.is_nullable}`);
    });

    // Get sample data
    console.log('\n📄 Sample Local Media Section Data:');
    console.log('─'.repeat(60));
    const sampleData = await prisma.$queryRaw`
      SELECT * FROM media_sections LIMIT 1
    `;

    if (sampleData.length > 0) {
      const sample = sampleData[0];
      Object.keys(sample).forEach(key => {
        console.log(`${key.padEnd(25)} | ${String(sample[key]).substring(0, 50)}`);
      });
    } else {
      console.log('No media sections found in local database');
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkLocalMediaSchema().catch(console.error); 