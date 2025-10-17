const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOrphanedHtmlSections() {
  try {
    console.log('🔍 Checking for orphaned HTML section records...');

    // First, let's check what pages exist
    const pages = await prisma.page.findMany({
      select: { id: true }
    });
    const pageIds = pages.map(p => p.id);
    console.log(`Found ${pageIds.length} pages in database`);

    // Find PageHtmlSection records with invalid page references
    const allPageHtmlSections = await prisma.pageHtmlSection.findMany({
      include: {
        htmlSection: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const orphanedPageHtmlSections = allPageHtmlSections.filter(
      record => !pageIds.includes(record.pageId)
    );

    console.log(`Found ${orphanedPageHtmlSections.length} orphaned PageHtmlSection records`);

    if (orphanedPageHtmlSections.length > 0) {
      console.log('Orphaned records:');
      orphanedPageHtmlSections.forEach(record => {
        console.log(`- PageHtmlSection ID: ${record.id}, Page ID: ${record.pageId}, HTML Section: ${record.htmlSection.name} (ID: ${record.htmlSection.id})`);
      });

      // Delete orphaned PageHtmlSection records
      const orphanedPageIds = orphanedPageHtmlSections.map(r => r.pageId);
      const deleteResult = await prisma.pageHtmlSection.deleteMany({
        where: {
          pageId: {
            in: orphanedPageIds
          }
        }
      });

      console.log(`✅ Deleted ${deleteResult.count} orphaned PageHtmlSection records`);
    }

    // Find PageSection records with invalid page references
    const allPageSections = await prisma.pageSection.findMany({
      include: {
        htmlSection: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const orphanedPageSections = allPageSections.filter(
      record => !pageIds.includes(record.pageId)
    );

    console.log(`Found ${orphanedPageSections.length} orphaned PageSection records`);

    if (orphanedPageSections.length > 0) {
      console.log('Orphaned records:');
      orphanedPageSections.forEach(record => {
        console.log(`- PageSection ID: ${record.id}, Page ID: ${record.pageId}, HTML Section: ${record.htmlSection?.name || 'Unknown'} (ID: ${record.htmlSection?.id || 'Unknown'})`);
      });

      // Delete orphaned PageSection records
      const orphanedPageIds = orphanedPageSections.map(r => r.pageId);
      const deleteResult = await prisma.pageSection.deleteMany({
        where: {
          pageId: {
            in: orphanedPageIds
          }
        }
      });

      console.log(`✅ Deleted ${deleteResult.count} orphaned PageSection records`);
    }

    // Check for any remaining orphaned records
    const remainingPageHtmlSections = await prisma.pageHtmlSection.findMany({
      include: {
        page: {
          select: { id: true }
        }
      }
    });

    const remainingOrphanedPageHtmlSections = remainingPageHtmlSections.filter(
      record => !pageIds.includes(record.pageId)
    );

    const remainingPageSections = await prisma.pageSection.findMany({
      include: {
        page: {
          select: { id: true }
        }
      }
    });

    const remainingOrphanedPageSections = remainingPageSections.filter(
      record => !pageIds.includes(record.pageId)
    );

    if (remainingOrphanedPageHtmlSections.length === 0 && remainingOrphanedPageSections.length === 0) {
      console.log('✅ All orphaned records have been cleaned up successfully!');
    } else {
      console.log(`⚠️  Warning: ${remainingOrphanedPageHtmlSections.length} PageHtmlSection and ${remainingOrphanedPageSections.length} PageSection records still have invalid page references`);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupOrphanedHtmlSections(); 