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

    // Check page sections
    const pageSectionsCount = await sourcePrisma.PageSection.count();
    console.log(`📄 Page Sections: ${pageSectionsCount} records`);

    if (pageSectionsCount > 0) {
      const pageSections = await sourcePrisma.PageSection.findMany({
        include: {
          page: true
        },
        take: 10
      });
      
      console.log('\n📋 Sample Page Sections:');
      pageSections.forEach(section => {
        console.log(`   • ${section.page.title} (${section.page.slug}) - ${section.sectionType} - ${section.title || 'No title'}`);
      });
    }

    // Check page feature groups
    const pageFeatureGroupsCount = await sourcePrisma.PageFeatureGroup.count();
    console.log(`\n🔗 Page Feature Groups: ${pageFeatureGroupsCount} records`);

    if (pageFeatureGroupsCount > 0) {
      const pageFeatureGroups = await sourcePrisma.PageFeatureGroup.findMany({
        include: {
          page: true,
          featureGroup: true
        },
        take: 10
      });
      
      console.log('\n📋 Sample Page Feature Groups:');
      pageFeatureGroups.forEach(pfg => {
        console.log(`   • ${pfg.page.title} - ${pfg.featureGroup.name}`);
      });
    }

    // Check related sections
    const heroSectionsCount = await sourcePrisma.HeroSection.count();
    console.log(`\n🎯 Hero Sections: ${heroSectionsCount} records`);

    const mediaSectionsCount = await sourcePrisma.MediaSection.count();
    console.log(`📷 Media Sections: ${mediaSectionsCount} records`);

    const pricingSectionsCount = await sourcePrisma.PricingSection.count();
    console.log(`💰 Pricing Sections: ${pricingSectionsCount} records`);

    const faqSectionsCount = await sourcePrisma.FAQSection.count();
    console.log(`❓ FAQ Sections: ${faqSectionsCount} records`);

    const htmlSectionsCount = await sourcePrisma.HtmlSection.count();
    console.log(`💻 HTML Sections: ${htmlSectionsCount} records`);

    const teamSectionsCount = await sourcePrisma.TeamSection?.count().catch(() => 0);
    console.log(`👥 Team Sections: ${teamSectionsCount} records`);

    // Check contact sections
    const contactSectionsCount = await sourcePrisma.ContactSection?.count().catch(() => 0);
    console.log(`📞 Contact Sections: ${contactSectionsCount} records`);

    console.log('\n📊 Page Builder Data Summary:');
    console.log('─'.repeat(60));
    console.log(`Page Sections: ${pageSectionsCount}`);
    console.log(`Page Feature Groups: ${pageFeatureGroupsCount}`);
    console.log(`Hero Sections: ${heroSectionsCount}`);
    console.log(`Media Sections: ${mediaSectionsCount}`);
    console.log(`Pricing Sections: ${pricingSectionsCount}`);
    console.log(`FAQ Sections: ${faqSectionsCount}`);
    console.log(`HTML Sections: ${htmlSectionsCount}`);
    console.log(`Team Sections: ${teamSectionsCount}`);
    console.log(`Contact Sections: ${contactSectionsCount}`);

    const totalPageBuilderData = pageSectionsCount + pageFeatureGroupsCount + heroSectionsCount + 
                                mediaSectionsCount + pricingSectionsCount + faqSectionsCount + 
                                htmlSectionsCount + teamSectionsCount + contactSectionsCount;
    
    console.log(`\n📈 Total Page Builder Records: ${totalPageBuilderData}`);

    if (totalPageBuilderData > 0) {
      console.log('\n✅ Page builder data found! This data needs to be copied.');
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