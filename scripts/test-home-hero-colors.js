const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHomeHeroColors() {
  try {
    console.log('🎨 Testing Home Hero Color Controls...');
    
    // Check current home hero data
    const homeHero = await prisma.homePageHero.findFirst({
      where: { isActive: true }
    });

    if (homeHero) {
      console.log('✅ Found active home hero with color fields:');
      console.log(`   Heading Color: ${homeHero.headingColor || '#1F2937'}`);
      console.log(`   Subheading Color: ${homeHero.subheadingColor || '#6B7280'}`);
      console.log(`   Trust Indicator Text Color: ${homeHero.trustIndicatorTextColor || '#6B7280'}`);
      console.log(`   Trust Indicator Background Color: ${homeHero.trustIndicatorBackgroundColor || '#F9FAFB'}`);
    } else {
      console.log('⚠️  No active home hero found');
    }

    // Test updating colors
    console.log('\n🔄 Testing color updates...');
    
    const updatedHero = await prisma.homePageHero.upsert({
      where: { id: homeHero?.id || 1 },
      update: {
        headingColor: '#FF0000',
        subheadingColor: '#00FF00',
        trustIndicatorTextColor: '#0000FF',
        trustIndicatorBackgroundColor: '#FFFF00'
      },
      create: {
        headline: 'Test Hero',
        subheading: 'Test subheading',
        backgroundColor: '#FFFFFF',
        isActive: true,
        headingColor: '#FF0000',
        subheadingColor: '#00FF00',
        trustIndicatorTextColor: '#0000FF',
        trustIndicatorBackgroundColor: '#FFFF00'
      }
    });

    console.log('✅ Updated home hero with test colors:');
    console.log(`   Heading Color: ${updatedHero.headingColor}`);
    console.log(`   Subheading Color: ${updatedHero.subheadingColor}`);
    console.log(`   Trust Indicator Text Color: ${updatedHero.trustIndicatorTextColor}`);
    console.log(`   Trust Indicator Background Color: ${updatedHero.trustIndicatorBackgroundColor}`);

    console.log('\n🎉 Color controls are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing home hero colors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testHomeHeroColors(); 