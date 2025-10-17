const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkHomeHeroStatus() {
  console.log('🔍 Checking HomePageHero table status...');
  console.log('='.repeat(80));
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    // Check if home_page_hero table exists and has data
    const homeHeroCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM home_page_hero
    `;
    console.log(`📊 HomePageHero records: ${homeHeroCount[0].count}`);

    if (homeHeroCount[0].count > 0) {
      const homeHeroData = await prisma.$queryRaw`
        SELECT * FROM home_page_hero
      `;
      
      console.log('\n📋 HomePageHero Data:');
      homeHeroData.forEach((hero, index) => {
        console.log(`\n   ${index + 1}. ID: ${hero.id}`);
        console.log(`      Tagline: ${hero.tagline || 'Not set'}`);
        console.log(`      Headline: ${hero.headline || 'Not set'}`);
        console.log(`      Subheading: ${hero.subheading || 'Not set'}`);
        console.log(`      Background Color: ${hero.backgroundColor || 'Not set'}`);
        console.log(`      Is Active: ${hero.isActive}`);
        console.log(`      Animation Type: ${hero.animationType || 'Not set'}`);
        console.log(`      Created At: ${hero.createdAt}`);
        console.log(`      Updated At: ${hero.updatedAt}`);
      });
    } else {
      console.log('\n⚠️  No HomePageHero records found');
    }

    // Check if there are any pages
    const pageCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM pages
    `;
    console.log(`\n📄 Pages: ${pageCount[0].count} records`);

    // Check if there are any page sections
    const pageSectionCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM page_sections
    `;
    console.log(`📋 Page Sections: ${pageSectionCount[0].count} records`);

    console.log('\n' + '='.repeat(80));
    console.log('📊 DATABASE STATUS SUMMARY');
    console.log('='.repeat(80));
    console.log(`HomePageHero: ${homeHeroCount[0].count} records`);
    console.log(`Pages: ${pageCount[0].count} records`);
    console.log(`Page Sections: ${pageSectionCount[0].count} records`);
    
    if (homeHeroCount[0].count > 0) {
      console.log('\n✅ HomePageHero data exists - the database constraint error should be resolved');
    } else {
      console.log('\n⚠️  No HomePageHero data found - this might cause issues');
    }

  } catch (error) {
    console.error('❌ Error checking HomePageHero status:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkHomeHeroStatus().catch(console.error); 