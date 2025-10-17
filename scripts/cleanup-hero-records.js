const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupHeroRecords() {
  try {
    console.log('🧹 Cleaning up hero records...');
    
    // Get all hero records
    const heroes = await prisma.homePageHero.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log(`Found ${heroes.length} hero records:`);
    heroes.forEach((hero, index) => {
      console.log(`  ${index + 1}. ID: ${hero.id}, Active: ${hero.isActive}, Heading: ${hero.headline?.substring(0, 30)}...`);
    });
    
    if (heroes.length === 0) {
      console.log('No hero records found. Creating a default one...');
      
      const defaultHero = await prisma.homePageHero.create({
        data: {
          headline: 'Automate Conversations, Capture Leads, Serve Customers — All Without Code',
          subheading: 'Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.',
          backgroundColor: '#FFFFFF',
          layoutType: 'split',
          mediaPosition: 'right',
          mediaSize: 'full',
          heroHeight: 'auto',
          lineSpacing: '4',
          isActive: true,
          headingColor: '#1F2937',
          subheadingColor: '#6B7280',
          trustIndicatorTextColor: '#6B7280',
          trustIndicatorBackgroundColor: '#F9FAFB',
          trustIndicators: JSON.stringify([
            { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
            { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
            { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
          ])
        }
      });
      
      console.log(`✅ Created default hero with ID: ${defaultHero.id}`);
      return;
    }
    
    // If there are multiple records, keep the first one and delete the rest
    if (heroes.length > 1) {
      console.log('\n🗑️  Multiple hero records found. Cleaning up...');
      
      // Keep the first record and deactivate all others
      const firstHero = heroes[0];
      const otherHeroes = heroes.slice(1);
      
      // Deactivate all other heroes
      for (const hero of otherHeroes) {
        await prisma.homePageHero.update({
          where: { id: hero.id },
          data: { isActive: false }
        });
        console.log(`  Deactivated hero ID: ${hero.id}`);
      }
      
      // Ensure the first hero is active
      await prisma.homePageHero.update({
        where: { id: firstHero.id },
        data: { isActive: true }
      });
      
      console.log(`✅ Kept hero ID: ${firstHero.id} as active`);
    } else {
      // Only one record, ensure it's active
      await prisma.homePageHero.update({
        where: { id: heroes[0].id },
        data: { isActive: true }
      });
      
      console.log(`✅ Ensured hero ID: ${heroes[0].id} is active`);
    }
    
    // Verify the cleanup
    const activeHeroes = await prisma.homePageHero.findMany({
      where: { isActive: true }
    });
    
    console.log(`\n✅ Cleanup complete. Active heroes: ${activeHeroes.length}`);
    activeHeroes.forEach(hero => {
      console.log(`  Active hero ID: ${hero.id}, Heading: ${hero.headline?.substring(0, 30)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error cleaning up hero records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupHeroRecords(); 