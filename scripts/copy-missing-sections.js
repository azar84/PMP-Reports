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
  console.log('🔧 Copying missing sections that page builder data references...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    let totalCopied = 0;

    // Copy HeroSection data with safe approach
    console.log('🎯 Copying HeroSection data...');
    try {
      const heroSectionsCount = await sourcePrisma.HeroSection.count();
      console.log(`   📊 Found ${heroSectionsCount} hero sections in source`);

      if (heroSectionsCount > 0) {
        // Get hero sections with raw SQL to avoid schema issues
        const sourceHeroSections = await sourcePrisma.$queryRaw`
          SELECT 
            id, name, "layoutType", "sectionHeight", tagline, headline, subheading,
            "textAlignment", "ctaPrimaryId", "ctaSecondaryId", "mediaUrl", "mediaType",
            "mediaAlt", "mediaHeight", "mediaPosition", "backgroundType", "backgroundValue",
            "taglineColor", "headlineColor", "subheadingColor", "ctaPrimaryBgColor",
            "ctaPrimaryTextColor", "ctaSecondaryBgColor", "ctaSecondaryTextColor",
            "showTypingEffect", "enableBackgroundAnimation", "customClasses",
            "paddingTop", "paddingBottom", "containerMaxWidth", visible,
            "createdAt", "updatedAt"
          FROM "hero_sections"
        `;

        console.log(`   📥 Retrieved ${sourceHeroSections.length} hero sections`);

        // Clear existing hero sections in target
        const deletedCount = await targetPrisma.HeroSection.deleteMany({});
        console.log(`   🗑️  Cleared ${deletedCount.count} existing hero sections`);

        // Insert hero sections one by one
        let successCount = 0;
        for (const heroSection of sourceHeroSections) {
          try {
            await targetPrisma.HeroSection.create({
              data: {
                id: heroSection.id,
                name: heroSection.name,
                layoutType: heroSection.layoutType,
                sectionHeight: heroSection.sectionHeight,
                tagline: heroSection.tagline,
                headline: heroSection.headline,
                subheading: heroSection.subheading,
                textAlignment: heroSection.textAlignment,
                ctaPrimaryId: heroSection.ctaPrimaryId,
                ctaSecondaryId: heroSection.ctaSecondaryId,
                mediaUrl: heroSection.mediaUrl,
                mediaType: heroSection.mediaType,
                mediaAlt: heroSection.mediaAlt,
                mediaHeight: heroSection.mediaHeight,
                mediaPosition: heroSection.mediaPosition,
                backgroundType: heroSection.backgroundType,
                backgroundValue: heroSection.backgroundValue,
                taglineColor: heroSection.taglineColor,
                headlineColor: heroSection.headlineColor,
                subheadingColor: heroSection.subheadingColor,
                ctaPrimaryBgColor: heroSection.ctaPrimaryBgColor,
                ctaPrimaryTextColor: heroSection.ctaPrimaryTextColor,
                ctaSecondaryBgColor: heroSection.ctaSecondaryBgColor,
                ctaSecondaryTextColor: heroSection.ctaSecondaryTextColor,
                showTypingEffect: heroSection.showTypingEffect,
                enableBackgroundAnimation: heroSection.enableBackgroundAnimation,
                customClasses: heroSection.customClasses,
                paddingTop: heroSection.paddingTop,
                paddingBottom: heroSection.paddingBottom,
                containerMaxWidth: heroSection.containerMaxWidth,
                visible: heroSection.visible,
                createdAt: heroSection.createdAt,
                updatedAt: heroSection.updatedAt
              }
            });
            successCount++;
          } catch (error) {
            console.log(`   ❌ Error inserting hero section ${heroSection.id}: ${error.message}`);
          }
        }

        console.log(`   ✅ Successfully copied ${successCount} hero sections`);
        totalCopied += successCount;
      }
    } catch (error) {
      console.log(`   ❌ Error copying HeroSection: ${error.message}`);
    }

    // Copy MediaSection data with safe approach
    console.log('\n📷 Copying MediaSection data...');
    try {
      const mediaSectionsCount = await sourcePrisma.MediaSection.count();
      console.log(`   📊 Found ${mediaSectionsCount} media sections in source`);

      if (mediaSectionsCount > 0) {
        // Get media sections with raw SQL to avoid schema issues
        const sourceMediaSections = await sourcePrisma.$queryRaw`
          SELECT 
            id, name, title, subtitle, description, "mediaUrl", "mediaType",
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
                name: mediaSection.name,
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
        totalCopied += successCount;
      }
    } catch (error) {
      console.log(`   ❌ Error copying MediaSection: ${error.message}`);
    }

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 MISSING SECTIONS COPY SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total sections copied: ${totalCopied}`);
    console.log('✅ Missing sections copy completed!');

    if (totalCopied > 0) {
      console.log('\n🎯 Missing sections have been copied!');
      console.log('🔄 Now you can run the page builder copy again.');
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
copyMissingSections().catch(console.error); 