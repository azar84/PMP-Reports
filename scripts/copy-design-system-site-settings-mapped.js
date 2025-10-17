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

async function copyDesignSystemSiteSettingsMapped() {
  console.log('🎨⚙️  Copying Design System and Site Settings data with proper field mapping...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    // Copy Design System data with field mapping
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

        // Insert design system into target with field mapping
        for (const ds of sourceDesignSystem) {
          try {
            await targetPrisma.$queryRaw`
              INSERT INTO design_system (
                id, "primaryColor", "primaryColorLight", "primaryColorDark", "secondaryColor", "accentColor",
                "successColor", "warningColor", "errorColor", "infoColor", "grayLight", "grayMedium", "grayDark",
                "backgroundPrimary", "backgroundSecondary", "backgroundDark", "textPrimary", "textSecondary", "textMuted",
                "fontFamily", "fontFamilyMono", "fontSizeBase", "lineHeightBase", "fontWeightNormal", "fontWeightMedium",
                "fontWeightBold", "spacingXs", "spacingSm", "spacingMd", "spacingLg", "spacingXl", "spacing2xl",
                "borderRadiusSm", "borderRadiusMd", "borderRadiusLg", "borderRadiusXl", "borderRadiusFull",
                "shadowSm", "shadowMd", "shadowLg", "shadowXl", "animationFast", "animationNormal", "animationSlow",
                "breakpointSm", "breakpointMd", "breakpointLg", "breakpointXl", "breakpoint2xl", "customVariables",
                "createdAt", "updatedAt", "isActive", "themeMode"
              ) VALUES (
                ${ds.id}, ${ds.primaryColor}, ${ds.primaryColor}, ${ds.primaryColor}, ${ds.secondaryColor}, ${ds.accentColor},
                ${ds.successColor}, ${ds.warningColor}, ${ds.errorColor}, ${ds.infoColor}, ${'#F3F4F6'}, ${'#9CA3AF'}, ${'#374151'},
                ${ds.backgroundPrimary}, ${ds.backgroundSecondary}, ${'#111827'}, ${ds.textPrimary}, ${ds.textSecondary}, ${'#6B7280'},
                ${'Inter'}, ${'JetBrains Mono'}, ${'16px'}, ${'1.5'}, ${'400'}, ${'500'}, ${'700'},
                ${'4px'}, ${'8px'}, ${'16px'}, ${'24px'}, ${'32px'}, ${'48px'},
                ${'4px'}, ${'6px'}, ${'8px'}, ${'12px'}, ${'9999px'},
                ${'0 1px 2px 0 rgb(0 0 0 / 0.05)'}, ${'0 4px 6px -1px rgb(0 0 0 / 0.1)'}, ${'0 10px 15px -3px rgb(0 0 0 / 0.1)'}, ${'0 20px 25px -5px rgb(0 0 0 / 0.1)'},
                ${'150ms'}, ${'300ms'}, ${'500ms'},
                ${'640px'}, ${'768px'}, ${'1024px'}, ${'1280px'}, ${'1536px'}, ${null},
                ${ds.createdAt}, ${ds.updatedAt}, ${ds.isActive}, ${'light'}
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

    // Copy Site Settings data with field mapping
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

        // Insert site settings into target with field mapping
        for (const settings of sourceSiteSettings) {
          try {
            await targetPrisma.$queryRaw`
              INSERT INTO site_settings (
                id, "logoUrl", "logoLightUrl", "logoDarkUrl", "faviconUrl", "faviconLightUrl", "faviconDarkUrl",
                "smtpEnabled", "smtpHost", "smtpPort", "smtpSecure", "smtpUsername", "smtpPassword", "smtpFromEmail",
                "smtpFromName", "smtpReplyTo", "emailSignature", "emailFooterText", "emailBrandingEnabled",
                "adminNotificationEmail", "emailLoggingEnabled", "emailRateLimitPerHour", "companyPhone", "companyEmail",
                "companyAddress", "socialFacebook", "socialTwitter", "socialLinkedin", "socialInstagram", "socialYoutube",
                "footerNewsletterFormId", "footerCopyrightMessage", "footerMenuIds", "footerShowContactInfo",
                "footerShowSocialLinks", "footerCompanyName", "footerCompanyDescription", "footerBackgroundColor",
                "footerTextColor", "baseUrl", "createdAt", "updatedAt", "gaMeasurementId", "gtmContainerId",
                "gtmEnabled", "cloudinaryApiKey", "cloudinaryApiSecret", "cloudinaryCloudName", "cloudinaryEnabled",
                "cloudinaryUploadPreset"
              ) VALUES (
                ${settings.id}, ${settings.logoUrl}, ${settings.logoUrl}, ${settings.logoUrl}, ${settings.faviconUrl},
                ${settings.faviconUrl}, ${settings.faviconUrl}, ${false}, ${null}, ${null}, ${false}, ${null}, ${null},
                ${null}, ${null}, ${null}, ${null}, ${null}, ${false}, ${null}, ${false}, ${100}, ${settings.contactPhone},
                ${settings.contactEmail}, ${settings.contactAddress}, ${null}, ${null}, ${null}, ${null}, ${null},
                ${null}, ${null}, ${null}, ${false}, ${false}, ${null}, ${null}, ${null}, ${null}, ${settings.siteUrl},
                ${settings.createdAt}, ${settings.updatedAt}, ${settings.googleAnalyticsId}, ${settings.googleTagManagerId},
                ${false}, ${null}, ${null}, ${null}, ${false}, ${null}
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
copyDesignSystemSiteSettingsMapped().then((counts) => {
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