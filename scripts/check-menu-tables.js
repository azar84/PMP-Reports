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

async function checkMenuTables() {
  console.log('🔍 Checking Menu-related tables in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Get all table names
    const tables = await sourcePrisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    // Look for menu-related tables
    console.log('🔍 Menu-related Tables:');
    console.log('─'.repeat(60));
    const menuTables = tables.filter(table => 
      table.table_name.toLowerCase().includes('menu') ||
      table.table_name.toLowerCase().includes('nav')
    );
    
    if (menuTables.length > 0) {
      menuTables.forEach((table, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${table.table_name}`);
      });
    } else {
      console.log('No menu-related tables found');
    }

    // Check for any table with 'menu' in the name
    console.log('\n📋 All Tables (for reference):');
    console.log('─'.repeat(60));
    tables.forEach((table, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${table.table_name}`);
    });

    console.log(`\n📊 Total Tables Found: ${tables.length}`);
    console.log(`🎯 Menu-related Tables: ${menuTables.length}`);

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkMenuTables().catch(console.error); 