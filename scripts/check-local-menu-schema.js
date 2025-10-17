const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkLocalMenuSchema() {
  console.log('🔍 Checking local Menu and MenuItem schema...');
  console.log('='.repeat(80));
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    // Get Menu table structure
    console.log('📋 Local Menu Table Structure:');
    console.log('─'.repeat(60));
    const menuTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Menu'
      ORDER BY ordinal_position
    `;

    menuTableInfo.forEach(column => {
      console.log(`${column.column_name.padEnd(25)} | ${column.data_type.padEnd(15)} | ${column.is_nullable}`);
    });

    // Get MenuItem table structure
    console.log('\n📋 Local MenuItem Table Structure:');
    console.log('─'.repeat(60));
    const menuItemTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'MenuItem'
      ORDER BY ordinal_position
    `;

    menuItemTableInfo.forEach(column => {
      console.log(`${column.column_name.padEnd(25)} | ${column.data_type.padEnd(15)} | ${column.is_nullable}`);
    });

    // Get sample data
    console.log('\n📄 Sample Local Menu Data:');
    console.log('─'.repeat(60));
    const sampleMenuData = await prisma.$queryRaw`
      SELECT * FROM "Menu" LIMIT 1
    `;

    if (sampleMenuData.length > 0) {
      const sample = sampleMenuData[0];
      Object.keys(sample).forEach(key => {
        console.log(`${key.padEnd(25)} | ${String(sample[key]).substring(0, 50)}`);
      });
    } else {
      console.log('No menu data found in local database');
    }

    console.log('\n📄 Sample Local MenuItem Data:');
    console.log('─'.repeat(60));
    const sampleMenuItemData = await prisma.$queryRaw`
      SELECT * FROM "MenuItem" LIMIT 1
    `;

    if (sampleMenuItemData.length > 0) {
      const sample = sampleMenuItemData[0];
      Object.keys(sample).forEach(key => {
        console.log(`${key.padEnd(25)} | ${String(sample[key]).substring(0, 50)}`);
      });
    } else {
      console.log('No menu item data found in local database');
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkLocalMenuSchema().catch(console.error); 