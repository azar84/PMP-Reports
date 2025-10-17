const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCTAData() {
  try {
    console.log('🔍 Checking CTA data...');
    
    const ctas = await prisma.cTA.findMany({
      include: {
        headerCTAs: true,
        heroPrimary: true,
        heroSecondary: true,
        homeHeroPrimary: true,
        homeHeroSecondary: true,
        mediaSection: true
      }
    });

    console.log(`Found ${ctas.length} CTAs:`);
    
    ctas.forEach((cta, index) => {
      console.log(`\n${index + 1}. CTA ID: ${cta.id}`);
      console.log(`   Text: ${cta.text}`);
      console.log(`   URL: ${cta.url}`);
      console.log(`   Style: ${cta.style}`);
      console.log(`   Is Active: ${cta.isActive}`);
      console.log(`   Events:`, cta.events);
      
      if (cta.events && Array.isArray(cta.events)) {
        console.log(`   Event Details:`);
        cta.events.forEach((event, eventIndex) => {
          console.log(`     ${eventIndex + 1}. Event Type: ${event.eventType}`);
          console.log(`        Function Name: ${event.functionName}`);
          console.log(`        Description: ${event.description}`);
        });
      }
      
      console.log(`   Usage:`);
      console.log(`     - Header CTAs: ${cta.headerCTAs.length}`);
      console.log(`     - Hero Primary: ${cta.heroPrimary.length}`);
      console.log(`     - Hero Secondary: ${cta.heroSecondary.length}`);
      console.log(`     - Home Hero Primary: ${cta.homeHeroPrimary.length}`);
      console.log(`     - Home Hero Secondary: ${cta.homeHeroSecondary.length}`);
      console.log(`     - Media Section: ${cta.mediaSection.length}`);
    });

    // Check for any CTAs with events that might contain the problematic functions
    const ctasWithEvents = ctas.filter(cta => cta.events && Array.isArray(cta.events) && cta.events.length > 0);
    
    if (ctasWithEvents.length > 0) {
      console.log(`\n⚠️  Found ${ctasWithEvents.length} CTAs with events:`);
      ctasWithEvents.forEach(cta => {
        console.log(`\nCTA ID ${cta.id} (${cta.text}):`);
        cta.events.forEach(event => {
          if (event.functionName.includes('getFullQueryString') || event.functionName.includes('goToLogin')) {
            console.log(`   ❌ PROBLEMATIC EVENT: ${event.eventType} -> ${event.functionName}`);
          } else {
            console.log(`   ✅ Event: ${event.eventType} -> ${event.functionName}`);
          }
        });
      });
    } else {
      console.log('\n✅ No CTAs with events found');
    }

  } catch (error) {
    console.error('Error checking CTA data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCTAData(); 