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

async function copyMediaSectionsCorrect() {
  console.log('📷 Copying MediaSection data with correct schema...');
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
            id, position, "layoutType", "badgeText", "badgeColor", headline, subheading,
            alignment, "mediaType", "mediaUrl", "mediaAlt", "mediaSize", "mediaPosition",
            "showBadge", "showCtaButton", "ctaText", "ctaUrl", "ctaStyle",
            "enableScrollAnimations", "animationType", "backgroundStyle", "backgroundColor",
            "textColor", "paddingTop", "paddingBottom", "containerMaxWidth", "isActive",
            "createdAt", "updatedAt"
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
                position: mediaSection.position,
                layoutType: mediaSection.layoutType,
                badgeText: mediaSection.badgeText,
                badgeColor: mediaSection.badgeColor,
                headline: mediaSection.headline,
                subheading: mediaSection.subheading,
                alignment: mediaSection.alignment,
                mediaType: mediaSection.mediaType,
                mediaUrl: mediaSection.mediaUrl,
                mediaAlt: mediaSection.mediaAlt,
                mediaSize: mediaSection.mediaSize,
                mediaPosition: mediaSection.mediaPosition,
                showBadge: mediaSection.showBadge,
                showCtaButton: mediaSection.showCtaButton,
                ctaText: mediaSection.ctaText,
                ctaUrl: mediaSection.ctaUrl,
                ctaStyle: mediaSection.ctaStyle,
                enableScrollAnimations: mediaSection.enableScrollAnimations,
                animationType: mediaSection.animationType,
                backgroundStyle: mediaSection.backgroundStyle,
                backgroundColor: mediaSection.backgroundColor,
                textColor: mediaSection.textColor,
                paddingTop: mediaSection.paddingTop,
                paddingBottom: mediaSection.paddingBottom,
                containerMaxWidth: mediaSection.containerMaxWidth,
                isActive: mediaSection.isActive,
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
copyMediaSectionsCorrect().catch(console.error); 