const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verifyHomeHeroCopy() {
  console.log('🔍 Verifying Home Page Hero data copy...');
  console.log('='.repeat(80));
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    // Check HomePageHero data
    const homePageHeroCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM home_page_hero
    `;
    console.log(`🏠 Home Page Hero Records: ${homePageHeroCount[0].count} records`);

    if (homePageHeroCount[0].count > 0) {
      const homePageHeroData = await prisma.$queryRaw`
        SELECT * FROM home_page_hero
      `;
      
      console.log('\n📋 Home Page Hero Data:');
      homePageHeroData.forEach((hero, index) => {
        console.log(`\n   ${index + 1}. Home Page Hero ID: ${hero.id}`);
        console.log(`      Tagline: ${hero.tagline || 'No tagline'}`);
        console.log(`      Headline: ${hero.headline || 'No headline'}`);
        console.log(`      Subheading: ${hero.subheading || 'No subheading'}`);
        console.log(`      Primary CTA ID: ${hero.ctaPrimaryId || 'None'}`);
        console.log(`      Secondary CTA ID: ${hero.ctaSecondaryId || 'None'}`);
        console.log(`      Media URL: ${hero.mediaUrl || 'None'}`);
        console.log(`      Background Color: ${hero.backgroundColor || 'None'}`);
        console.log(`      Is Active: ${hero.isActive}`);
        console.log(`      Created At: ${hero.createdAt}`);
        console.log(`      Updated At: ${hero.updatedAt}`);
      });
    }

    // Check if there are any page sections that reference home_hero
    const homeHeroSections = await prisma.PageSection.findMany({
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

    console.log('\n' + '='.repeat(80));
    console.log('🎉 HOME PAGE HERO COPY VERIFICATION');
    console.log('='.repeat(80));
    console.log(`✅ Home Page Hero Records: ${homePageHeroCount[0].count}`);
    console.log(`✅ Home Hero Page Sections: ${homeHeroSections.length}`);
    
    if (homePageHeroCount[0].count > 0) {
      console.log('\n✅ Home page hero data successfully copied!');
      console.log('🌐 The home page should now display with the proper hero content.');
      console.log('🔄 The development server is running with the complete saski-ai-website data.');
    } else {
      console.log('\n⚠️  No home page hero data found in local database.');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

verifyHomeHeroCopy().catch(console.error); 