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

async function checkHomePageHeroData() {
  console.log('🔍 Checking Home Page Hero data in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Check HomePageHero data
    const homePageHeroCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM home_page_hero
    `;
    console.log(`🏠 Home Page Hero Records: ${homePageHeroCount[0].count} records`);

    if (homePageHeroCount[0].count > 0) {
      const homePageHeroData = await sourcePrisma.$queryRaw`
        SELECT * FROM home_page_hero
      `;
      
      console.log('\n📋 Home Page Hero Data:');
      homePageHeroData.forEach((hero, index) => {
        console.log(`\n   ${index + 1}. Home Page Hero ID: ${hero.id}`);
        console.log(`      Tagline: ${hero.tagline || 'No tagline'}`);
        console.log(`      Headline: ${hero.headline || 'No headline'}`);
        console.log(`      Subheading: ${hero.subheading || 'No subheading'}`);
        console.log(`      Layout Type: ${hero.layoutType || 'No layout type'}`);
        console.log(`      Text Alignment: ${hero.textAlignment || 'No alignment'}`);
        console.log(`      Media URL: ${hero.mediaUrl || 'None'}`);
        console.log(`      Media Type: ${hero.mediaType || 'No media type'}`);
        console.log(`      Background Type: ${hero.backgroundType || 'No background type'}`);
        console.log(`      Background Value: ${hero.backgroundValue || 'No background value'}`);
        console.log(`      Show Typing Effect: ${hero.showTypingEffect}`);
        console.log(`      Enable Background Animation: ${hero.enableBackgroundAnimation}`);
        console.log(`      Primary CTA ID: ${hero.ctaPrimaryId || 'None'}`);
        console.log(`      Secondary CTA ID: ${hero.ctaSecondaryId || 'None'}`);
        console.log(`      Visible: ${hero.visible}`);
        console.log(`      Created At: ${hero.createdAt}`);
        console.log(`      Updated At: ${hero.updatedAt}`);
      });
    }

    // Check if there are any page sections that reference home_page_hero
    const homeHeroSections = await sourcePrisma.PageSection.findMany({
      where: {
        sectionType: 'home_hero'
      },
      include: {
        page: true
      }
    });

    console.log(`\n📄 Home Hero Page Sections: ${homeHeroSections.length} records`);
    homeHeroSections.forEach((section, index) => {
      console.log(`   ${index + 1}. Page: ${section.page.title} (${section.page.slug})`);
      console.log(`      Section ID: ${section.id}, Hero Section ID: ${section.heroSectionId}`);
    });

    console.log('\n📊 Home Page Hero Data Summary:');
    console.log('─'.repeat(60));
    console.log(`Home Page Hero Records: ${homePageHeroCount[0].count}`);
    console.log(`Home Hero Page Sections: ${homeHeroSections.length}`);
    
    if (homePageHeroCount[0].count > 0) {
      console.log('\n✅ Home page hero data found! This data needs to be copied.');
    } else {
      console.log('\n⚠️  No home page hero data found in saski-ai-website database.');
    }

  } catch (error) {
    console.error('❌ Error checking home page hero data:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkHomePageHeroData().catch(console.error); 