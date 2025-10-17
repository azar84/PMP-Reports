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

async function checkPageBuilderData() {
  console.log('🔍 Checking page builder data in saski-ai-website database...\n');
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Check page sections (simple count)
    const pageSectionsCount = await sourcePrisma.PageSection.count();
    console.log(`📄 Page Sections: ${pageSectionsCount} records`);

    // Check page feature groups
    const pageFeatureGroupsCount = await sourcePrisma.PageFeatureGroup.count();
    console.log(`🔗 Page Feature Groups: ${pageFeatureGroupsCount} records`);

    // Check related sections that we already copied
    const heroSectionsCount = await sourcePrisma.HeroSection.count();
    console.log(`🎯 Hero Sections: ${heroSectionsCount} records`);

    const mediaSectionsCount = await sourcePrisma.MediaSection.count();
    console.log(`📷 Media Sections: ${mediaSectionsCount} records`);

    const pricingSectionsCount = await sourcePrisma.PricingSection.count();
    console.log(`💰 Pricing Sections: ${pricingSectionsCount} records`);

    const faqSectionsCount = await sourcePrisma.FAQSection.count();
    console.log(`❓ FAQ Sections: ${faqSectionsCount} records`);

    const htmlSectionsCount = await sourcePrisma.HtmlSection.count();
    console.log(`💻 HTML Sections: ${htmlSectionsCount} records`);

    console.log('\n📊 Page Builder Data Summary:');
    console.log('─'.repeat(60));
    console.log(`Page Sections: ${pageSectionsCount}`);
    console.log(`Page Feature Groups: ${pageFeatureGroupsCount}`);
    console.log(`Hero Sections: ${heroSectionsCount}`);
    console.log(`Media Sections: ${mediaSectionsCount}`);
    console.log(`Pricing Sections: ${pricingSectionsCount}`);
    console.log(`FAQ Sections: ${faqSectionsCount}`);
    console.log(`HTML Sections: ${htmlSectionsCount}`);

    const totalPageBuilderData = pageSectionsCount + pageFeatureGroupsCount;
    
    console.log(`\n📈 Core Page Builder Records: ${totalPageBuilderData}`);
    console.log(`📈 Section Content Records: ${heroSectionsCount + mediaSectionsCount + pricingSectionsCount + faqSectionsCount + htmlSectionsCount}`);

    if (totalPageBuilderData > 0) {
      console.log('\n✅ Page builder data found! This data needs to be copied.');
      console.log('📋 Missing tables to copy:');
      console.log('   • PageSection');
      console.log('   • PageFeatureGroup');
    } else {
      console.log('\n⚠️  No page builder data found in saski-ai-website database.');
    }

  } catch (error) {
    console.error('❌ Error checking page builder data:', error);
  } finally {
    await sourcePrisma.$disconnect();
  }
}

checkPageBuilderData().catch(console.error); 