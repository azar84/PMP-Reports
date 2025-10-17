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

async function copyDesignSystemSiteSettings() {
  console.log('🎨⚙️  Copying Design System and Site Settings data from saski-ai-website to local database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    // Copy Design System data
    console.log('🎨 Copying Design System data...');
    let designSystemSuccessCount = 0;
    try {
      const designSystemCount = await sourcePrisma.$queryRaw`
        SELECT COUNT(*) as count FROM design_system
      `;
      console.log(`   📊 Found ${designSystemCount[0].count} design system records in source`);

      if (designSystemCount[0].count > 0) {
        // Get design system data with raw SQL
        const sourceDesignSystem = await sourcePrisma.$queryRaw`
          SELECT * FROM design_system
        `;
        
        console.log(`   📥 Retrieved ${sourceDesignSystem.length} design system records from source`);

        // Clear existing design system in target
        await targetPrisma.$queryRaw`
          DELETE FROM design_system
        `;
        console.log(`   🗑️  Cleared existing design system from target`);

        // Insert design system into target
        for (const ds of sourceDesignSystem) {
          try {
            await targetPrisma.$queryRaw`
              INSERT INTO design_system (
                id, "primaryColor", "secondaryColor", "accentColor", "textPrimary", "textSecondary",
                "backgroundPrimary", "backgroundSecondary", "borderColor", "successColor", "warningColor",
                "errorColor", "infoColor", "isActive", "createdAt", "updatedAt"
              ) VALUES (
                ${ds.id}, ${ds.primaryColor}, ${ds.secondaryColor}, ${ds.accentColor}, ${ds.textPrimary},
                ${ds.textSecondary}, ${ds.backgroundPrimary}, ${ds.backgroundSecondary}, ${ds.borderColor},
                ${ds.successColor}, ${ds.warningColor}, ${ds.errorColor}, ${ds.infoColor}, ${ds.isActive},
                ${ds.createdAt}, ${ds.updatedAt}
              )
            `;
            designSystemSuccessCount++;
          } catch (error) {
            console.log(`   ❌ Error inserting design system ${ds.id}: ${error.message}`);
          }
        }

        console.log(`   ✅ Successfully copied ${designSystemSuccessCount} design system records`);
      } else {
        console.log(`   ⚠️  No design system records found in source`);
      }
    } catch (error) {
      console.log(`   ❌ Error copying Design System: ${error.message}`);
    }

    // Copy Site Settings data
    console.log('\n⚙️  Copying Site Settings data...');
    let siteSettingsSuccessCount = 0;
    try {
      const siteSettingsCount = await sourcePrisma.$queryRaw`
        SELECT COUNT(*) as count FROM site_settings
      `;
      console.log(`   📊 Found ${siteSettingsCount[0].count} site settings records in source`);

      if (siteSettingsCount[0].count > 0) {
        // Get site settings data with raw SQL
        const sourceSiteSettings = await sourcePrisma.$queryRaw`
          SELECT * FROM site_settings
        `;
        
        console.log(`   📥 Retrieved ${sourceSiteSettings.length} site settings records from source`);

        // Clear existing site settings in target
        await targetPrisma.$queryRaw`
          DELETE FROM site_settings
        `;
        console.log(`   🗑️  Cleared existing site settings from target`);

        // Insert site settings into target
        for (const settings of sourceSiteSettings) {
          try {
            await targetPrisma.$queryRaw`
              INSERT INTO site_settings (
                id, "siteName", "siteDescription", "siteUrl", "logoUrl", "faviconUrl", "metaTitle",
                "metaDescription", "metaKeywords", "googleAnalyticsId", "googleTagManagerId", "facebookPixelId",
                "contactEmail", "contactPhone", "contactAddress", "socialMedia", "isActive", "createdAt", "updatedAt"
              ) VALUES (
                ${settings.id}, ${settings.siteName}, ${settings.siteDescription}, ${settings.siteUrl},
                ${settings.logoUrl}, ${settings.faviconUrl}, ${settings.metaTitle}, ${settings.metaDescription},
                ${settings.metaKeywords}, ${settings.googleAnalyticsId}, ${settings.googleTagManagerId},
                ${settings.facebookPixelId}, ${settings.contactEmail}, ${settings.contactPhone},
                ${settings.contactAddress}, ${settings.socialMedia}, ${settings.isActive || true},
                ${settings.createdAt}, ${settings.updatedAt}
              )
            `;
            siteSettingsSuccessCount++;
          } catch (error) {
            console.log(`   ❌ Error inserting site settings ${settings.id}: ${error.message}`);
          }
        }

        console.log(`   ✅ Successfully copied ${siteSettingsSuccessCount} site settings records`);
      } else {
        console.log(`   ⚠️  No site settings records found in source`);
      }
    } catch (error) {
      console.log(`   ❌ Error copying Site Settings: ${error.message}`);
    }

    return { designSystem: designSystemSuccessCount, siteSettings: siteSettingsSuccessCount };

  } catch (error) {
    console.error('❌ Database connection error:', error);
    return { designSystem: 0, siteSettings: 0 };
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    console.log('\n🔌 Database connections closed');
  }
}

// Run the copy
copyDesignSystemSiteSettings().then((counts) => {
  console.log('\n' + '='.repeat(80));
  console.log('📊 DESIGN SYSTEM & SITE SETTINGS COPY SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total design system records copied: ${counts.designSystem}`);
  console.log(`Total site settings records copied: ${counts.siteSettings}`);
  console.log('✅ Design system and site settings copy completed!');

  if (counts.designSystem > 0 || counts.siteSettings > 0) {
    console.log('\n🎯 Design system and site settings data has been successfully copied!');
    console.log('🎨 The website should now use the proper design system colors and styling.');
    console.log('⚙️  Site settings including logo, meta tags, and contact info are now configured.');
    console.log('🔄 You may need to restart the development server to see the changes.');
  }
}).catch(console.error); 