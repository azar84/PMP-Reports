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

async function checkScriptsData() {
  console.log('🔍 Checking Scripts data in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Check ScriptSection data
    const scriptSectionsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM script_sections
    `;
    console.log(`📜 Script Sections: ${scriptSectionsCount[0].count} records`);

    if (scriptSectionsCount[0].count > 0) {
      const scriptSectionsData = await sourcePrisma.$queryRaw`
        SELECT * FROM script_sections
      `;
      
      console.log('\n📋 Script Sections Data:');
      scriptSectionsData.forEach((script, index) => {
        console.log(`\n   ${index + 1}. Script Section ID: ${script.id}`);
        console.log(`      Name: ${script.name || 'No name'}`);
        console.log(`      Title: ${script.title || 'No title'}`);
        console.log(`      Description: ${script.description || 'No description'}`);
        console.log(`      Script Type: ${script.scriptType || 'No type'}`);
        console.log(`      Script Content: ${script.scriptContent ? script.scriptContent.substring(0, 100) + '...' : 'No content'}`);
        console.log(`      Position: ${script.position || 'No position'}`);
        console.log(`      Is Active: ${script.isActive}`);
        console.log(`      Created At: ${script.createdAt}`);
        console.log(`      Updated At: ${script.updatedAt}`);
      });
    }

    // Check if there are any page sections that reference script sections
    const scriptPageSections = await sourcePrisma.PageSection.findMany({
      where: {
        sectionType: 'script'
      },
      include: {
        page: true
      }
    });

    console.log(`\n📄 Script Page Sections: ${scriptPageSections.length} records`);
    scriptPageSections.forEach((section, index) => {
      console.log(`   ${index + 1}. Page: ${section.page.title} (${section.page.slug})`);
      console.log(`      Section ID: ${section.id}, Script Section ID: ${section.scriptSectionId}`);
    });

    // Check all script-related page sections
    const allScriptSections = await sourcePrisma.PageSection.findMany({
      where: {
        sectionType: 'script'
      },
      include: {
        page: true
      }
    });

    console.log(`\n📄 All Script Page Sections: ${allScriptSections.length} records`);
    allScriptSections.forEach((section, index) => {
      console.log(`   ${index + 1}. Page: ${section.page.title} (${section.page.slug}) - ${section.sectionType}`);
      console.log(`      Section ID: ${section.id}, Script Section ID: ${section.scriptSectionId}`);
    });

    console.log('\n📊 Scripts Data Summary:');
    console.log('─'.repeat(60));
    console.log(`Script Sections: ${scriptSectionsCount[0].count}`);
    console.log(`Script Page Sections: ${scriptPageSections.length}`);
    console.log(`All Script Page Sections: ${allScriptSections.length}`);
    
    if (scriptSectionsCount[0].count > 0) {
      console.log('\n✅ Scripts data found! This data needs to be copied.');
    } else {
      console.log('\n⚠️  No scripts data found in saski-ai-website database.');
    }

  } catch (error) {
    console.error('❌ Error checking scripts data:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkScriptsData().catch(console.error); 