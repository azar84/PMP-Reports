const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCTAEvents() {
  try {
    console.log('🔧 Fixing CTA events...');
    
    const ctas = await prisma.cTA.findMany({
      where: {
        events: {
          not: null
        }
      }
    });

    console.log(`Found ${ctas.length} CTAs with events to fix:`);
    
    for (const cta of ctas) {
      if (cta.events && Array.isArray(cta.events)) {
        let updated = false;
        const fixedEvents = cta.events.map(event => {
          if (event.functionName && event.functionName.trim() !== event.functionName) {
            console.log(`  Fixing CTA ${cta.id}: "${event.functionName}" -> "${event.functionName.trim()}"`);
            updated = true;
            return {
              ...event,
              functionName: event.functionName.trim()
            };
          }
          return event;
        });

        if (updated) {
          await prisma.cTA.update({
            where: { id: cta.id },
            data: { events: fixedEvents }
          });
          console.log(`  ✅ Updated CTA ${cta.id}`);
        }
      }
    }

    console.log('✅ CTA events fixed successfully');

  } catch (error) {
    console.error('Error fixing CTA events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCTAEvents(); 