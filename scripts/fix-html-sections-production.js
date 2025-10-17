const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixHtmlSectionsProduction() {
  try {
    console.log('🔧 Fixing HTML sections for production...');

    // Step 1: Check for orphaned PageHtmlSection records
    console.log('\n📋 Step 1: Checking PageHtmlSection records...');
    
    const allPageHtmlSections = await prisma.pageHtmlSection.findMany({
      include: {
        page: {
          select: { id: true, title: true }
        },
        htmlSection: {
          select: { id: true, name: true }
        }
      }
    });

    const orphanedPageHtmlSections = allPageHtmlSections.filter(
      record => !record.page
    );

    console.log(`Found ${orphanedPageHtmlSections.length} orphaned PageHtmlSection records`);

    if (orphanedPageHtmlSections.length > 0) {
      console.log('Orphaned PageHtmlSection records:');
      orphanedPageHtmlSections.forEach(record => {
        console.log(`- ID: ${record.id}, Page ID: ${record.pageId}, HTML Section: ${record.htmlSection.name}`);
      });

      // Delete orphaned records
      const orphanedIds = orphanedPageHtmlSections.map(r => r.id);
      const deleteResult = await prisma.pageHtmlSection.deleteMany({
        where: {
          id: {
            in: orphanedIds
          }
        }
      });

      console.log(`✅ Deleted ${deleteResult.count} orphaned PageHtmlSection records`);
    }

    // Step 2: Check for orphaned PageSection records
    console.log('\n📋 Step 2: Checking PageSection records...');
    
    const allPageSections = await prisma.pageSection.findMany({
      include: {
        page: {
          select: { id: true, title: true }
        },
        htmlSection: {
          select: { id: true, name: true }
        }
      }
    });

    const orphanedPageSections = allPageSections.filter(
      record => !record.page
    );

    console.log(`Found ${orphanedPageSections.length} orphaned PageSection records`);

    if (orphanedPageSections.length > 0) {
      console.log('Orphaned PageSection records:');
      orphanedPageSections.forEach(record => {
        console.log(`- ID: ${record.id}, Page ID: ${record.pageId}, HTML Section: ${record.htmlSection?.name || 'Unknown'}`);
      });

      // Delete orphaned records
      const orphanedIds = orphanedPageSections.map(r => r.id);
      const deleteResult = await prisma.pageSection.deleteMany({
        where: {
          id: {
            in: orphanedIds
          }
        }
      });

      console.log(`✅ Deleted ${deleteResult.count} orphaned PageSection records`);
    }

    // Step 3: Verify all HTML sections are accessible
    console.log('\n📋 Step 3: Verifying HTML sections...');
    
    const htmlSections = await prisma.htmlSection.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`Found ${htmlSections.length} HTML sections`);

    // Step 4: Test the API endpoint logic
    console.log('\n📋 Step 4: Testing API endpoint logic...');
    
    const testSections = await Promise.all(
      htmlSections.slice(0, 3).map(async (section) => {
        const [pageHtmlSectionsCount, pageSectionsCount] = await Promise.all([
          prisma.pageHtmlSection.count({
            where: { htmlSectionId: section.id }
          }),
          prisma.pageSection.count({
            where: { htmlSectionId: section.id }
          })
        ]);

        return {
          id: section.id,
          name: section.name,
          counts: {
            pageHtmlSections: pageHtmlSectionsCount,
            pageSections: pageSectionsCount
          }
        };
      })
    );

    console.log('Test sections with counts:');
    testSections.forEach(section => {
      console.log(`- ${section.name} (ID: ${section.id}): ${section.counts.pageHtmlSections} pageHtmlSections, ${section.counts.pageSections} pageSections`);
    });

    // Step 5: Final verification
    console.log('\n📋 Step 5: Final verification...');
    
    const remainingOrphanedPageHtmlSections = await prisma.pageHtmlSection.findMany({
      include: {
        page: {
          select: { id: true }
        }
      }
    });

    const remainingOrphanedPageSections = await prisma.pageSection.findMany({
      include: {
        page: {
          select: { id: true }
        }
      }
    });

    const stillOrphanedPageHtmlSections = remainingOrphanedPageHtmlSections.filter(r => !r.page);
    const stillOrphanedPageSections = remainingOrphanedPageSections.filter(r => !r.page);

    if (stillOrphanedPageHtmlSections.length === 0 && stillOrphanedPageSections.length === 0) {
      console.log('✅ All orphaned records have been cleaned up successfully!');
      console.log('✅ HTML sections API should now work correctly');
    } else {
      console.log(`⚠️  Warning: ${stillOrphanedPageHtmlSections.length} PageHtmlSection and ${stillOrphanedPageSections.length} PageSection records still have issues`);
    }

    console.log('\n🎉 HTML sections fix completed!');

  } catch (error) {
    console.error('❌ Error during HTML sections fix:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixHtmlSectionsProduction(); 