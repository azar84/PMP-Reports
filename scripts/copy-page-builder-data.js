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

async function copyPageBuilderData() {
  console.log('🚀 Copying page builder data from saski-ai-website to local database...');
  console.log('='.repeat(80));
  
  try {
    // Test connections
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    let totalCopied = 0;
    let totalErrors = 0;

    // Copy PageSection data
    console.log('📄 Copying PageSection data...');
    try {
      const pageSectionsCount = await sourcePrisma.PageSection.count();
      console.log(`   📊 Found ${pageSectionsCount} page sections in source`);

      if (pageSectionsCount > 0) {
        // Get all page sections from source
        const sourcePageSections = await sourcePrisma.PageSection.findMany();
        console.log(`   📥 Retrieved ${sourcePageSections.length} page sections from source`);

        // Clear existing page sections in target
        const deletedCount = await targetPrisma.PageSection.deleteMany({});
        console.log(`   🗑️  Cleared ${deletedCount.count} existing page sections from target`);

        // Insert page sections into target
        const result = await targetPrisma.PageSection.createMany({
          data: sourcePageSections,
          skipDuplicates: true
        });

        console.log(`   ✅ Successfully copied ${result.count} page sections`);
        totalCopied += result.count;

        // Verify the copy
        const targetCount = await targetPrisma.PageSection.count();
        console.log(`   🔍 Verification: ${targetCount} page sections in target (should match ${sourcePageSections.length})`);
        
        if (targetCount === sourcePageSections.length) {
          console.log(`   ✅ Page sections verification passed!`);
        } else {
          console.log(`   ⚠️  Page sections verification failed: expected ${sourcePageSections.length}, got ${targetCount}`);
        }
      } else {
        console.log(`   ⚠️  No page sections found in source`);
      }
    } catch (error) {
      console.error(`   ❌ Error copying PageSection:`, error.message);
      totalErrors++;
    }

    // Copy PageFeatureGroup data
    console.log('\n🔗 Copying PageFeatureGroup data...');
    try {
      const pageFeatureGroupsCount = await sourcePrisma.PageFeatureGroup.count();
      console.log(`   📊 Found ${pageFeatureGroupsCount} page feature groups in source`);

      if (pageFeatureGroupsCount > 0) {
        // Get all page feature groups from source
        const sourcePageFeatureGroups = await sourcePrisma.PageFeatureGroup.findMany();
        console.log(`   📥 Retrieved ${sourcePageFeatureGroups.length} page feature groups from source`);

        // Clear existing page feature groups in target
        const deletedCount = await targetPrisma.PageFeatureGroup.deleteMany({});
        console.log(`   🗑️  Cleared ${deletedCount.count} existing page feature groups from target`);

        // Insert page feature groups into target
        const result = await targetPrisma.PageFeatureGroup.createMany({
          data: sourcePageFeatureGroups,
          skipDuplicates: true
        });

        console.log(`   ✅ Successfully copied ${result.count} page feature groups`);
        totalCopied += result.count;

        // Verify the copy
        const targetCount = await targetPrisma.PageFeatureGroup.count();
        console.log(`   🔍 Verification: ${targetCount} page feature groups in target (should match ${sourcePageFeatureGroups.length})`);
        
        if (targetCount === sourcePageFeatureGroups.length) {
          console.log(`   ✅ Page feature groups verification passed!`);
        } else {
          console.log(`   ⚠️  Page feature groups verification failed: expected ${sourcePageFeatureGroups.length}, got ${targetCount}`);
        }
      } else {
        console.log(`   ⚠️  No page feature groups found in source`);
      }
    } catch (error) {
      console.error(`   ❌ Error copying PageFeatureGroup:`, error.message);
      totalErrors++;
    }

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 Page Builder Copy Summary');
    console.log('='.repeat(80));
    console.log(`Total records copied: ${totalCopied}`);
    console.log(`Errors: ${totalErrors}`);
    console.log('✅ Page builder data copy completed!');

    if (totalCopied > 0) {
      console.log('\n🎯 Page builder data has been successfully copied!');
      console.log('🌐 The pages should now display with their proper sections and content.');
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    console.log('🔌 Database connections closed');
  }
}

// Run the copy
copyPageBuilderData().catch(console.error); 