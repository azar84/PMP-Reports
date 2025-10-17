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

async function copyMissingSections() {
  console.log('🔧 Copying missing sections that page builder data depends on...\n');
  
  let totalCopied = 0;

  // Copy HeroSection data
  try {
    const heroSectionsCount = await sourcePrisma.HeroSection.count();
    if (heroSectionsCount > 0) {
      const sourceHeroSections = await sourcePrisma.HeroSection.findMany();
      const deletedCount = await targetPrisma.HeroSection.deleteMany({});
      const result = await targetPrisma.HeroSection.createMany({
        data: sourceHeroSections,
        skipDuplicates: true
      });
      console.log(`✅ Hero Sections: ${result.count} records copied`);
      totalCopied += result.count;
    }
  } catch (error) {
    console.log(`⚠️  Hero Sections: ${error.message}`);
  }

  // Copy MediaSection data
  try {
    const mediaSectionsCount = await sourcePrisma.MediaSection.count();
    if (mediaSectionsCount > 0) {
      const sourceMediaSections = await sourcePrisma.MediaSection.findMany();
      const deletedCount = await targetPrisma.MediaSection.deleteMany({});
      const result = await targetPrisma.MediaSection.createMany({
        data: sourceMediaSections,
        skipDuplicates: true
      });
      console.log(`✅ Media Sections: ${result.count} records copied`);
      totalCopied += result.count;
    }
  } catch (error) {
    console.log(`⚠️  Media Sections: ${error.message}`);
  }

  // Copy ContactSection data
  try {
    const contactSectionsCount = await sourcePrisma.ContactSection?.count().catch(() => 0);
    if (contactSectionsCount > 0) {
      const sourceContactSections = await sourcePrisma.ContactSection.findMany();
      const deletedCount = await targetPrisma.ContactSection.deleteMany({});
      const result = await targetPrisma.ContactSection.createMany({
        data: sourceContactSections,
        skipDuplicates: true
      });
      console.log(`✅ Contact Sections: ${result.count} records copied`);
      totalCopied += result.count;
    }
  } catch (error) {
    console.log(`⚠️  Contact Sections: ${error.message}`);
  }

  console.log(`\n📊 Total missing sections copied: ${totalCopied}`);
  return totalCopied;
}

async function copyPageBuilderDataComplete() {
  console.log('🚀 Copying complete page builder data from saski-ai-website to local database...');
  console.log('='.repeat(80));
  
  try {
    // Test connections
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    // First, copy missing sections
    await copyMissingSections();

    let totalCopied = 0;
    let totalErrors = 0;

    // Copy PageSection data
    console.log('\n📄 Copying PageSection data...');
    try {
      const pageSectionsCount = await sourcePrisma.PageSection.count();
      console.log(`   📊 Found ${pageSectionsCount} page sections in source`);

      if (pageSectionsCount > 0) {
        // Get page sections with correct column names
        const sourcePageSections = await sourcePrisma.$queryRaw`
          SELECT 
            "id", "pageId", "sectionType", "title", "subtitle", "content", 
            "sortOrder", "isVisible", "heroSectionId", "featureGroupId", 
            "mediaSectionId", "pricingSectionId", "faqSectionId", 
            "faqCategoryId", "contactSectionId", "formId", "htmlSectionId",
            "createdAt", "updatedAt"
          FROM "page_sections"
        `;
        
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
    console.log('📊 Complete Page Builder Copy Summary');
    console.log('='.repeat(80));
    console.log(`Total records copied: ${totalCopied}`);
    console.log(`Errors: ${totalErrors}`);
    console.log('✅ Complete page builder data copy completed!');

    if (totalCopied > 0) {
      console.log('\n🎯 Page builder data has been successfully copied!');
      console.log('🌐 The pages should now display with their proper sections and content.');
      console.log('🔄 You may need to restart the development server to see the changes.');
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
copyPageBuilderDataComplete().catch(console.error); 