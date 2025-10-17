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

async function checkAvailableTables() {
  console.log('🔍 Checking all available tables in saski-ai-website database...');
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

    console.log('📋 Available Tables:');
    console.log('─'.repeat(60));
    tables.forEach((table, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${table.table_name}`);
    });

    // Look for hero-related tables
    console.log('\n🔍 Hero-related Tables:');
    console.log('─'.repeat(60));
    const heroTables = tables.filter(table => 
      table.table_name.toLowerCase().includes('hero') ||
      table.table_name.toLowerCase().includes('home')
    );
    
    if (heroTables.length > 0) {
      heroTables.forEach((table, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${table.table_name}`);
      });
    } else {
      console.log('No hero-related tables found');
    }

    // Check for any table with 'home' in the name
    console.log('\n🏠 Home-related Tables:');
    console.log('─'.repeat(60));
    const homeTables = tables.filter(table => 
      table.table_name.toLowerCase().includes('home')
    );
    
    if (homeTables.length > 0) {
      homeTables.forEach((table, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${table.table_name}`);
      });
    } else {
      console.log('No home-related tables found');
    }

    console.log(`\n📊 Total Tables Found: ${tables.length}`);
    console.log(`🎯 Hero-related Tables: ${heroTables.length}`);
    console.log(`🏠 Home-related Tables: ${homeTables.length}`);

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkAvailableTables().catch(console.error); 