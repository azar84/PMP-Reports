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

async function copyScriptsData() {
  console.log('📜 Copying Scripts data from saski-ai-website to local database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    // Copy ScriptSection data
    console.log('📜 Copying Script Sections data...');
    try {
      const scriptSectionsCount = await sourcePrisma.$queryRaw`
        SELECT COUNT(*) as count FROM script_sections
      `;
      console.log(`   📊 Found ${scriptSectionsCount[0].count} script sections in source`);

      if (scriptSectionsCount[0].count > 0) {
        // Get script sections data with raw SQL
        const sourceScriptSections = await sourcePrisma.$queryRaw`
          SELECT * FROM script_sections
        `;
        
        console.log(`   📥 Retrieved ${sourceScriptSections.length} script sections from source`);

        // Clear existing script sections in target
        await targetPrisma.$queryRaw`
          DELETE FROM script_sections
        `;
        console.log(`   🗑️  Cleared existing script sections from target`);

        // Insert script sections into target
        let successCount = 0;
        for (const script of sourceScriptSections) {
          try {
            await targetPrisma.$queryRaw`
              INSERT INTO script_sections (
                id, name, title, description, "scriptType", "scriptContent",
                position, "isActive", "createdAt", "updatedAt"
              ) VALUES (
                ${script.id}, ${script.name}, ${script.title}, ${script.description},
                ${script.scriptType}, ${script.scriptContent}, ${script.position},
                ${script.isActive}, ${script.createdAt}, ${script.updatedAt}
              )
            `;
            successCount++;
          } catch (error) {
            console.log(`   ❌ Error inserting script section ${script.id}: ${error.message}`);
          }
        }

        console.log(`   ✅ Successfully copied ${successCount} script sections`);
        return successCount;
      } else {
        console.log(`   ⚠️  No script sections found in source`);
        return 0;
      }
    } catch (error) {
      console.log(`   ❌ Error copying Script Sections: ${error.message}`);
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
copyScriptsData().then((count) => {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SCRIPTS COPY SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total records copied: ${count}`);
  console.log('✅ Scripts data copy completed!');

  if (count > 0) {
    console.log('\n🎯 Scripts data has been successfully copied!');
    console.log('🌐 The website should now include the proper scripts (analytics, tracking, etc.).');
    console.log('🔄 You may need to restart the development server to see the changes.');
  }
}).catch(console.error); 