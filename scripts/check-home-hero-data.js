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

async function checkHomeHeroData() {
  console.log('🔍 Checking Home Hero data in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Check HomeHero data
    const homeHeroCount = await sourcePrisma.HomeHero.count();
    console.log(`🏠 Home Hero Records: ${homeHeroCount} records`);

    if (homeHeroCount > 0) {
      const homeHeroData = await sourcePrisma.HomeHero.findMany({
        include: {
          ctaPrimary: true,
          ctaSecondary: true
        }
      });
      
      console.log('\n📋 Home Hero Data:');
      homeHeroData.forEach((hero, index) => {
        console.log(`\n   ${index + 1}. Home Hero ID: ${hero.id}`);
        console.log(`      Tagline: ${hero.tagline}`);
        console.log(`      Headline: ${hero.headline}`);
        console.log(`      Subheading: ${hero.subheading}`);
        console.log(`      Layout Type: ${hero.layoutType}`);
        console.log(`      Text Alignment: ${hero.textAlignment}`);
        console.log(`      Media URL: ${hero.mediaUrl || 'None'}`);
        console.log(`      Media Type: ${hero.mediaType}`);
        console.log(`      Background Type: ${hero.backgroundType}`);
        console.log(`      Background Value: ${hero.backgroundValue}`);
        console.log(`      Show Typing Effect: ${hero.showTypingEffect}`);
        console.log(`      Enable Background Animation: ${hero.enableBackgroundAnimation}`);
        console.log(`      Primary CTA: ${hero.ctaPrimary?.text || 'None'}`);
        console.log(`      Secondary CTA: ${hero.ctaSecondary?.text || 'None'}`);
      });
    }

    // Check if there are any page sections that reference home_hero
    const homeHeroSections = await sourcePrisma.PageSection.findMany({
      where: {
        sectionType: 'home_hero'
      },
      include: {
        page: true,
        heroSection: true
      }
    });

    console.log(`\n📄 Home Hero Page Sections: ${homeHeroSections.length} records`);
    homeHeroSections.forEach((section, index) => {
      console.log(`   ${index + 1}. Page: ${section.page.title} (${section.page.slug})`);
      console.log(`      Section ID: ${section.id}, Hero Section ID: ${section.heroSectionId}`);
    });

    console.log('\n📊 Home Hero Data Summary:');
    console.log('─'.repeat(60));
    console.log(`Home Hero Records: ${homeHeroCount}`);
    console.log(`Home Hero Page Sections: ${homeHeroSections.length}`);
    
    if (homeHeroCount > 0) {
      console.log('\n✅ Home hero data found! This data needs to be copied.');
    } else {
      console.log('\n⚠️  No home hero data found in saski-ai-website database.');
    }

  } catch (error) {
    console.error('❌ Error checking home hero data:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkHomeHeroData().catch(console.error); 