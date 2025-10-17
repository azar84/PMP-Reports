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

async function copyMediaSectionsFixed() {
  console.log('📷 Copying MediaSection data with correct column names...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    // Copy MediaSection data with correct column names
    console.log('📷 Copying MediaSection data...');
    try {
      const mediaSectionsCount = await sourcePrisma.MediaSection.count();
      console.log(`   📊 Found ${mediaSectionsCount} media sections in source`);

      if (mediaSectionsCount > 0) {
        // Get media sections with correct column names
        const sourceMediaSections = await sourcePrisma.$queryRaw`
          SELECT 
            id, title, subtitle, description, "mediaUrl", "mediaType",
            "mediaAlt", "mediaHeight", "mediaPosition", "backgroundType",
            "backgroundValue", "titleColor", "subtitleColor", "descriptionColor",
            "customClasses", "paddingTop", "paddingBottom", "containerMaxWidth",
            visible, "createdAt", "updatedAt"
          FROM "media_sections"
        `;

        console.log(`   📥 Retrieved ${sourceMediaSections.length} media sections`);

        // Clear existing media sections in target
        const deletedCount = await targetPrisma.MediaSection.deleteMany({});
        console.log(`   🗑️  Cleared ${deletedCount.count} existing media sections`);

        // Insert media sections one by one
        let successCount = 0;
        for (const mediaSection of sourceMediaSections) {
          try {
            await targetPrisma.MediaSection.create({
              data: {
                id: mediaSection.id,
                title: mediaSection.title,
                subtitle: mediaSection.subtitle,
                description: mediaSection.description,
                mediaUrl: mediaSection.mediaUrl,
                mediaType: mediaSection.mediaType,
                mediaAlt: mediaSection.mediaAlt,
                mediaHeight: mediaSection.mediaHeight,
                mediaPosition: mediaSection.mediaPosition,
                backgroundType: mediaSection.backgroundType,
                backgroundValue: mediaSection.backgroundValue,
                titleColor: mediaSection.titleColor,
                subtitleColor: mediaSection.subtitleColor,
                descriptionColor: mediaSection.descriptionColor,
                customClasses: mediaSection.customClasses,
                paddingTop: mediaSection.paddingTop,
                paddingBottom: mediaSection.paddingBottom,
                containerMaxWidth: mediaSection.containerMaxWidth,
                visible: mediaSection.visible,
                createdAt: mediaSection.createdAt,
                updatedAt: mediaSection.updatedAt
              }
            });
            successCount++;
          } catch (error) {
            console.log(`   ❌ Error inserting media section ${mediaSection.id}: ${error.message}`);
          }
        }

        console.log(`   ✅ Successfully copied ${successCount} media sections`);
        return successCount;
      }
    } catch (error) {
      console.log(`   ❌ Error copying MediaSection: ${error.message}`);
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
copyMediaSectionsFixed().catch(console.error); 