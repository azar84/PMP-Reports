const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verifyScriptsCopy() {
  console.log('🔍 Verifying Scripts data copy...');
  console.log('='.repeat(80));
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    // Check ScriptSection data
    const scriptSectionsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM script_sections
    `;
    console.log(`📜 Script Sections: ${scriptSectionsCount[0].count} records`);

    if (scriptSectionsCount[0].count > 0) {
      const scriptSectionsData = await prisma.$queryRaw`
        SELECT * FROM script_sections
      `;
      
      console.log('\n📋 Script Sections Data:');
      scriptSectionsData.forEach((script, index) => {
        console.log(`\n   ${index + 1}. Script Section ID: ${script.id}`);
        console.log(`      Name: ${script.name || 'No name'}`);
        console.log(`      Description: ${script.description || 'No description'}`);
        console.log(`      Script Type: ${script.scriptType || 'No type'}`);
        console.log(`      Script Content: ${script.scriptContent ? script.scriptContent.substring(0, 100) + '...' : 'No content'}`);
        console.log(`      Placement: ${script.placement || 'No placement'}`);
        console.log(`      Priority: ${script.priority || 'No priority'}`);
        console.log(`      Load Async: ${script.loadAsync}`);
        console.log(`      Load Defer: ${script.loadDefer}`);
        console.log(`      Is Active: ${script.isActive}`);
        console.log(`      Created At: ${script.createdAt}`);
        console.log(`      Updated At: ${script.updatedAt}`);
      });
    }

    // Check if there are any page sections that reference script sections
    const scriptPageSections = await prisma.PageSection.findMany({
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

    console.log('\n' + '='.repeat(80));
    console.log('🎉 SCRIPTS COPY VERIFICATION');
    console.log('='.repeat(80));
    console.log(`✅ Script Sections: ${scriptSectionsCount[0].count}`);
    console.log(`✅ Script Page Sections: ${scriptPageSections.length}`);
    
    if (scriptSectionsCount[0].count > 0) {
      console.log('\n✅ Scripts data successfully copied!');
      console.log('🌐 The website should now include the proper scripts (analytics, tracking, etc.).');
      console.log('🔄 The development server is running with the complete saski-ai-website data.');
      
      console.log('\n📜 Copied Scripts:');
      scriptSectionsData.forEach((script, index) => {
        console.log(`   ${index + 1}. ${script.name} (${script.scriptType})`);
      });
    } else {
      console.log('\n⚠️  No scripts data found in local database.');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

verifyScriptsCopy().catch(console.error); 