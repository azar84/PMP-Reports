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

// Target database (local)
const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function copyHomePageHeroMapped() {
  console.log('🏠 Copying Home Page Hero data with proper field mapping...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    // Copy HomePageHero data with field mapping
    console.log('🏠 Copying Home Page Hero data...');
    try {
      const homePageHeroCount = await sourcePrisma.$queryRaw`
        SELECT COUNT(*) as count FROM home_page_hero
      `;
      console.log(`   📊 Found ${homePageHeroCount[0].count} home page hero records in source`);

      if (homePageHeroCount[0].count > 0) {
        // Get home page hero data with raw SQL
        const sourceHomePageHero = await sourcePrisma.$queryRaw`
          SELECT * FROM home_page_hero
        `;
        
        console.log(`   📥 Retrieved ${sourceHomePageHero.length} home page hero records from source`);

        // Clear existing home page hero in target
        await targetPrisma.$queryRaw`
          DELETE FROM home_page_hero
        `;
        console.log(`   🗑️  Cleared existing home page hero from target`);

        // Insert home page hero into target with field mapping
        let successCount = 0;
        for (const hero of sourceHomePageHero) {
          try {
            // Map fields from source schema to target schema
            await targetPrisma.$queryRaw`
              INSERT INTO home_page_hero (
                id, tagline, headline, subheading, "ctaPrimaryId", "ctaSecondaryId",
                "ctaPrimaryText", "ctaPrimaryUrl", "ctaSecondaryText", "ctaSecondaryUrl",
                "mediaUrl", "backgroundColor", "backgroundImage", "backgroundSize",
                "backgroundOverlay", "animationType", "animationData", "trustIndicators",
                "isActive", "createdAt", "updatedAt"
              ) VALUES (
                ${hero.id}, ${hero.tagline}, ${hero.headline}, ${hero.subheading},
                ${hero.ctaPrimaryId}, ${hero.ctaSecondaryId}, 
                ${null}, ${null}, ${null}, ${null}, -- CTA text/url fields don't exist in source
                ${hero.mediaUrl}, ${hero.backgroundValue}, ${null}, -- backgroundImage doesn't exist in source
                ${'cover'}, ${null}, ${null}, ${null}, -- backgroundOverlay, animationType, animationData, trustIndicators
                ${hero.visible || true}, ${hero.createdAt}, ${hero.updatedAt}
              )
            `;
            successCount++;
          } catch (error) {
            console.log(`   ❌ Error inserting home page hero ${hero.id}: ${error.message}`);
          }
        }

        console.log(`   ✅ Successfully copied ${successCount} home page hero records`);
        return successCount;
      } else {
        console.log(`   ⚠️  No home page hero records found in source`);
        return 0;
      }
    } catch (error) {
      console.log(`   ❌ Error copying Home Page Hero: ${error.message}`);
      return 0;
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
    return 0;
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    console.log('\n🔌 Database connections closed');
  }
}

// Run the copy
copyHomePageHeroMapped().then((count) => {
  console.log('\n' + '='.repeat(80));
  console.log('📊 HOME PAGE HERO COPY SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total records copied: ${count}`);
  console.log('✅ Home page hero data copy completed!');

  if (count > 0) {
    console.log('\n🎯 Home page hero data has been successfully copied!');
    console.log('🌐 The home page should now display with the proper hero content.');
    console.log('🔄 You may need to restart the development server to see the changes.');
  }
}).catch(console.error); 