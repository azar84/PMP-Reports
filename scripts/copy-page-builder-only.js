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

async function copyPageBuilderOnly() {
  console.log('🎯 Copying ONLY page builder data from saski-ai-website...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    // Step 1: Check what page sections exist in source
    console.log('📄 Step 1: Analyzing source page sections...');
    const pageSectionsCount = await sourcePrisma.PageSection.count();
    console.log(`   📊 Found ${pageSectionsCount} page sections in source`);

    if (pageSectionsCount === 0) {
      console.log('   ⚠️  No page sections found in source database');
      return;
    }

    // Step 2: Get page sections with raw SQL to avoid schema issues
    console.log('\n📄 Step 2: Retrieving page sections with safe query...');
    const sourcePageSections = await sourcePrisma.$queryRaw`
      SELECT 
        id, "pageId", "sectionType", title, subtitle, content, 
        "sortOrder", "isVisible", "heroSectionId", "featureGroupId", 
        "mediaSectionId", "pricingSectionId", "faqSectionId", 
        "faqCategoryId", "contactSectionId", "formId", "htmlSectionId",
        "createdAt", "updatedAt"
      FROM "page_sections"
      ORDER BY id
    `;
    
    console.log(`   📥 Retrieved ${sourcePageSections.length} page sections`);

    // Step 3: Show sample data
    console.log('\n📄 Step 3: Sample page sections:');
    sourcePageSections.slice(0, 5).forEach((section, index) => {
      console.log(`   ${index + 1}. Page ID: ${section.pageId}, Type: ${section.sectionType}, Title: ${section.title || 'No title'}`);
    });

    // Step 4: Clear existing page sections in target
    console.log('\n📄 Step 4: Clearing existing page sections in target...');
    const deletedCount = await targetPrisma.PageSection.deleteMany({});
    console.log(`   🗑️  Cleared ${deletedCount.count} existing page sections`);

    // Step 5: Insert page sections one by one to handle errors
    console.log('\n📄 Step 5: Inserting page sections...');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < sourcePageSections.length; i++) {
      const section = sourcePageSections[i];
      try {
        // Create the data object with only the fields that exist in target
        const sectionData = {
          id: section.id,
          pageId: section.pageId,
          sectionType: section.sectionType,
          title: section.title,
          subtitle: section.subtitle,
          content: section.content,
          sortOrder: section.sortOrder,
          isVisible: section.isVisible,
          heroSectionId: section.heroSectionId,
          featureGroupId: section.featureGroupId,
          mediaSectionId: section.mediaSectionId,
          pricingSectionId: section.pricingSectionId,
          faqSectionId: section.faqSectionId,
          faqCategoryId: section.faqCategoryId,
          contactSectionId: section.contactSectionId,
          formId: section.formId,
          htmlSectionId: section.htmlSectionId,
          createdAt: section.createdAt,
          updatedAt: section.updatedAt
        };

        await targetPrisma.PageSection.create({
          data: sectionData
        });
        
        successCount++;
        if (successCount % 5 === 0) {
          console.log(`   ✅ Inserted ${successCount}/${sourcePageSections.length} page sections`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          sectionId: section.id,
          error: error.message
        });
        console.log(`   ❌ Error inserting section ${section.id}: ${error.message}`);
      }
    }

    // Step 6: Verification
    console.log('\n📄 Step 6: Verification...');
    const targetCount = await targetPrisma.PageSection.count();
    console.log(`   🔍 Target database now has ${targetCount} page sections`);
    console.log(`   📊 Success: ${successCount}, Errors: ${errorCount}`);

    // Step 7: Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 PAGE BUILDER COPY SUMMARY');
    console.log('='.repeat(80));
    console.log(`Source page sections: ${sourcePageSections.length}`);
    console.log(`Successfully copied: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Final count in target: ${targetCount}`);

    if (successCount > 0) {
      console.log('\n✅ Page builder data successfully copied!');
      console.log('🌐 The pages should now display with their proper sections.');
      console.log('🔄 You may need to restart the development server.');
    } else {
      console.log('\n❌ No page sections were copied due to errors.');
      console.log('📋 Error details:');
      errors.slice(0, 5).forEach(error => {
        console.log(`   - Section ${error.sectionId}: ${error.error}`);
      });
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    console.log('\n🔌 Database connections closed');
  }
}

// Run the copy
copyPageBuilderOnly().catch(console.error); 