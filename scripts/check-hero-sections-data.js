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

async function checkHeroSectionsData() {
  console.log('🔍 Checking Hero Sections data in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Check HeroSection data
    const heroSectionsCount = await sourcePrisma.HeroSection.count();
    console.log(`🎯 Hero Sections: ${heroSectionsCount} records`);

    if (heroSectionsCount > 0) {
      const heroSectionsData = await sourcePrisma.HeroSection.findMany({
        include: {
          ctaPrimary: true,
          ctaSecondary: true
        }
      });
      
      console.log('\n📋 Hero Sections Data:');
      heroSectionsData.forEach((hero, index) => {
        console.log(`\n   ${index + 1}. Hero Section ID: ${hero.id}`);
        console.log(`      Name: ${hero.name || 'No name'}`);
        console.log(`      Tagline: ${hero.tagline || 'No tagline'}`);
        console.log(`      Headline: ${hero.headline}`);
        console.log(`      Subheading: ${hero.subheading || 'No subheading'}`);
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
        console.log(`      Visible: ${hero.visible}`);
      });
    }

    // Check if there are any page sections that reference hero sections
    const heroPageSections = await sourcePrisma.PageSection.findMany({
      where: {
        sectionType: 'home_hero'
      },
      include: {
        page: true,
        heroSection: true
      }
    });

    console.log(`\n📄 Home Hero Page Sections: ${heroPageSections.length} records`);
    heroPageSections.forEach((section, index) => {
      console.log(`   ${index + 1}. Page: ${section.page.title} (${section.page.slug})`);
      console.log(`      Section ID: ${section.id}, Hero Section ID: ${section.heroSectionId}`);
    });

    // Check all hero-related page sections
    const allHeroSections = await sourcePrisma.PageSection.findMany({
      where: {
        OR: [
          { sectionType: 'home_hero' },
          { sectionType: 'hero' }
        ]
      },
      include: {
        page: true,
        heroSection: true
      }
    });

    console.log(`\n📄 All Hero Page Sections: ${allHeroSections.length} records`);
    allHeroSections.forEach((section, index) => {
      console.log(`   ${index + 1}. Page: ${section.page.title} (${section.page.slug}) - ${section.sectionType}`);
      console.log(`      Section ID: ${section.id}, Hero Section ID: ${section.heroSectionId}`);
    });

    console.log('\n📊 Hero Sections Data Summary:');
    console.log('─'.repeat(60));
    console.log(`Hero Sections: ${heroSectionsCount}`);
    console.log(`Home Hero Page Sections: ${heroPageSections.length}`);
    console.log(`All Hero Page Sections: ${allHeroSections.length}`);
    
    if (heroSectionsCount > 0) {
      console.log('\n✅ Hero sections data found! This data needs to be copied.');
    } else {
      console.log('\n⚠️  No hero sections data found in saski-ai-website database.');
    }

  } catch (error) {
    console.error('❌ Error checking hero sections data:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkHeroSectionsData().catch(console.error); 