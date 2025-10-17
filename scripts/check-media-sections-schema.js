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

async function checkMediaSectionsSchema() {
  console.log('🔍 Checking MediaSection schema in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Source database connected\n');

    // Get table structure
    const tableInfo = await sourcePrisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'media_sections'
      ORDER BY ordinal_position
    `;

    console.log('📋 Media Sections Table Structure:');
    console.log('─'.repeat(60));
    tableInfo.forEach(column => {
      console.log(`${column.column_name.padEnd(25)} | ${column.data_type.padEnd(15)} | ${column.is_nullable}`);
    });

    // Get sample data
    console.log('\n📄 Sample Media Section Data:');
    console.log('─'.repeat(60));
    const sampleData = await sourcePrisma.$queryRaw`
      SELECT * FROM media_sections LIMIT 1
    `;

    if (sampleData.length > 0) {
      const sample = sampleData[0];
      Object.keys(sample).forEach(key => {
        console.log(`${key.padEnd(25)} | ${String(sample[key]).substring(0, 50)}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkMediaSectionsSchema().catch(console.error); 