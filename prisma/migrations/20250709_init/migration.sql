-- CreateTable
CREATE TABLE "site_settings" (
    "id" SERIAL NOT NULL,
    "logoUrl" TEXT,
    "logoLightUrl" TEXT,
    "logoDarkUrl" TEXT,
    "faviconUrl" TEXT,
    "faviconLightUrl" TEXT,
    "faviconDarkUrl" TEXT,
    "smtpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smtpHost" TEXT,
    "smtpPort" INTEGER DEFAULT 587,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
    "smtpUsername" TEXT,
    "smtpPassword" TEXT,
    "smtpFromEmail" TEXT,
    "smtpFromName" TEXT,
    "smtpReplyTo" TEXT,
    "emailSignature" TEXT,
    "emailFooterText" TEXT,
    "emailBrandingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "adminNotificationEmail" TEXT,
    "emailLoggingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailRateLimitPerHour" INTEGER DEFAULT 100,
    "companyPhone" TEXT,
    "companyEmail" TEXT,
    "companyAddress" TEXT,
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "socialLinkedin" TEXT,
    "socialInstagram" TEXT,
    "socialYoutube" TEXT,
    "footerNewsletterFormId" INTEGER,
    "footerCopyrightMessage" TEXT,
    "footerMenuIds" TEXT,
    "footerShowContactInfo" BOOLEAN NOT NULL DEFAULT true,
    "footerShowSocialLinks" BOOLEAN NOT NULL DEFAULT true,
    "footerCompanyName" TEXT,
    "footerCompanyDescription" TEXT,
    "footerBackgroundColor" TEXT DEFAULT '#F9FAFB',
    "footerTextColor" TEXT DEFAULT '#374151',
    "baseUrl" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gaMeasurementId" TEXT DEFAULT 'NULL',
    "gtmContainerId" TEXT DEFAULT 'NULL',
    "gtmEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_account_credentials" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "privateKeyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "authUri" TEXT NOT NULL,
    "tokenUri" TEXT NOT NULL,
    "authProviderX509CertUrl" TEXT NOT NULL,
    "clientX509CertUrl" TEXT NOT NULL,
    "universeDomain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_account_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitemap_submission_logs" (
    "id" TEXT NOT NULL,
    "sitemapUrl" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "searchEngine" TEXT NOT NULL,
    "googleResponse" TEXT,
    "errorMessage" TEXT,
    "statusCode" INTEGER,
    "submissionId" TEXT,
    "warnings" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sitemap_submission_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_system" (
    "id" SERIAL NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#5243E9',
    "primaryColorLight" TEXT NOT NULL DEFAULT '#6366F1',
    "primaryColorDark" TEXT NOT NULL DEFAULT '#4338CA',
    "secondaryColor" TEXT NOT NULL DEFAULT '#7C3AED',
    "accentColor" TEXT NOT NULL DEFAULT '#06B6D4',
    "successColor" TEXT NOT NULL DEFAULT '#10B981',
    "warningColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "errorColor" TEXT NOT NULL DEFAULT '#EF4444',
    "infoColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "grayLight" TEXT NOT NULL DEFAULT '#F9FAFB',
    "grayMedium" TEXT NOT NULL DEFAULT '#6B7280',
    "grayDark" TEXT NOT NULL DEFAULT '#374151',
    "backgroundPrimary" TEXT NOT NULL DEFAULT '#FFFFFF',
    "backgroundSecondary" TEXT NOT NULL DEFAULT '#F6F8FC',
    "backgroundDark" TEXT NOT NULL DEFAULT '#0F1A2A',
    "textPrimary" TEXT NOT NULL DEFAULT '#1F2937',
    "textSecondary" TEXT NOT NULL DEFAULT '#6B7280',
    "textMuted" TEXT NOT NULL DEFAULT '#9CA3AF',
    "fontFamily" TEXT NOT NULL DEFAULT 'Manrope',
    "fontFamilyMono" TEXT NOT NULL DEFAULT 'ui-monospace',
    "fontSizeBase" TEXT NOT NULL DEFAULT '16px',
    "lineHeightBase" TEXT NOT NULL DEFAULT '1.5',
    "fontWeightNormal" TEXT NOT NULL DEFAULT '400',
    "fontWeightMedium" TEXT NOT NULL DEFAULT '500',
    "fontWeightBold" TEXT NOT NULL DEFAULT '700',
    "spacingXs" TEXT NOT NULL DEFAULT '4px',
    "spacingSm" TEXT NOT NULL DEFAULT '8px',
    "spacingMd" TEXT NOT NULL DEFAULT '16px',
    "spacingLg" TEXT NOT NULL DEFAULT '24px',
    "spacingXl" TEXT NOT NULL DEFAULT '32px',
    "spacing2xl" TEXT NOT NULL DEFAULT '48px',
    "borderRadiusSm" TEXT NOT NULL DEFAULT '4px',
    "borderRadiusMd" TEXT NOT NULL DEFAULT '8px',
    "borderRadiusLg" TEXT NOT NULL DEFAULT '12px',
    "borderRadiusXl" TEXT NOT NULL DEFAULT '16px',
    "borderRadiusFull" TEXT NOT NULL DEFAULT '9999px',
    "shadowSm" TEXT NOT NULL DEFAULT '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    "shadowMd" TEXT NOT NULL DEFAULT '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    "shadowLg" TEXT NOT NULL DEFAULT '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    "shadowXl" TEXT NOT NULL DEFAULT '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    "animationFast" TEXT NOT NULL DEFAULT '150ms',
    "animationNormal" TEXT NOT NULL DEFAULT '300ms',
    "animationSlow" TEXT NOT NULL DEFAULT '500ms',
    "breakpointSm" TEXT NOT NULL DEFAULT '640px',
    "breakpointMd" TEXT NOT NULL DEFAULT '768px',
    "breakpointLg" TEXT NOT NULL DEFAULT '1024px',
    "breakpointXl" TEXT NOT NULL DEFAULT '1280px',
    "breakpoint2xl" TEXT NOT NULL DEFAULT '1536px',
    "themeMode" TEXT NOT NULL DEFAULT 'light',
    "customVariables" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_system_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "showInHeader" BOOLEAN NOT NULL DEFAULT false,
    "showInFooter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled Hero Section',
    "layoutType" TEXT NOT NULL DEFAULT 'split',
    "sectionHeight" TEXT NOT NULL DEFAULT '100vh',
    "tagline" TEXT,
    "headline" TEXT NOT NULL,
    "subheading" TEXT,
    "textAlignment" TEXT NOT NULL DEFAULT 'left',
    "ctaPrimaryId" INTEGER,
    "ctaSecondaryId" INTEGER,
    "mediaUrl" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "mediaAlt" TEXT,
    "mediaHeight" TEXT NOT NULL DEFAULT '80vh',
    "mediaPosition" TEXT NOT NULL DEFAULT 'right',
    "backgroundType" TEXT NOT NULL DEFAULT 'color',
    "backgroundValue" TEXT NOT NULL DEFAULT '#FFFFFF',
    "taglineColor" TEXT NOT NULL DEFAULT '#5243E9',
    "headlineColor" TEXT NOT NULL DEFAULT '#1F2937',
    "subheadingColor" TEXT NOT NULL DEFAULT '#6B7280',
    "ctaPrimaryBgColor" TEXT NOT NULL DEFAULT '#5243E9',
    "ctaPrimaryTextColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "ctaSecondaryBgColor" TEXT NOT NULL DEFAULT 'transparent',
    "ctaSecondaryTextColor" TEXT NOT NULL DEFAULT '#5243E9',
    "showTypingEffect" BOOLEAN NOT NULL DEFAULT false,
    "enableBackgroundAnimation" BOOLEAN NOT NULL DEFAULT false,
    "customClasses" TEXT,
    "paddingTop" INTEGER NOT NULL DEFAULT 80,
    "paddingBottom" INTEGER NOT NULL DEFAULT 80,
    "containerMaxWidth" TEXT NOT NULL DEFAULT '2xl',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "iconUrl" TEXT,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_sections" (
    "id" SERIAL NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "layoutType" TEXT NOT NULL DEFAULT 'media_right',
    "badgeText" TEXT,
    "badgeColor" TEXT NOT NULL DEFAULT '#5243E9',
    "headline" TEXT NOT NULL,
    "subheading" TEXT,
    "alignment" TEXT NOT NULL DEFAULT 'left',
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "mediaUrl" TEXT,
    "mediaAlt" TEXT,
    "mediaSize" TEXT NOT NULL DEFAULT 'md',
    "mediaPosition" TEXT NOT NULL DEFAULT 'right',
    "showBadge" BOOLEAN NOT NULL DEFAULT true,
    "showCtaButton" BOOLEAN NOT NULL DEFAULT false,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "ctaStyle" TEXT NOT NULL DEFAULT 'primary',
    "enableScrollAnimations" BOOLEAN NOT NULL DEFAULT false,
    "animationType" TEXT NOT NULL DEFAULT 'none',
    "backgroundStyle" TEXT NOT NULL DEFAULT 'solid',
    "backgroundColor" TEXT NOT NULL DEFAULT '#F6F8FC',
    "textColor" TEXT NOT NULL DEFAULT '#0F1A2A',
    "paddingTop" INTEGER NOT NULL DEFAULT 80,
    "paddingBottom" INTEGER NOT NULL DEFAULT 80,
    "containerMaxWidth" TEXT NOT NULL DEFAULT '2xl',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_section_features" (
    "id" SERIAL NOT NULL,
    "mediaSectionId" INTEGER NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'MessageSquare',
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#5243E9',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_section_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" SERIAL NOT NULL,
    "menuId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "icon" TEXT,
    "target" TEXT NOT NULL DEFAULT '_self',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "parentId" INTEGER,
    "pageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeaderConfigMenu" (
    "id" SERIAL NOT NULL,
    "headerConfigId" INTEGER NOT NULL,
    "menuId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeaderConfigMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_nav_items" (
    "id" SERIAL NOT NULL,
    "headerConfigId" INTEGER NOT NULL,
    "pageId" INTEGER,
    "label" TEXT NOT NULL,
    "customText" TEXT,
    "customUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_nav_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_config" (
    "id" SERIAL NOT NULL,
    "logoUrl" TEXT,
    "logoAlt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "menuActiveColor" TEXT DEFAULT '#5243E9',
    "menuHoverColor" TEXT DEFAULT '#5243E9',
    "menuTextColor" TEXT DEFAULT '#374151',

    CONSTRAINT "header_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ctas" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "style" TEXT NOT NULL DEFAULT 'primary',
    "target" TEXT NOT NULL DEFAULT '_self',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ctas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_ctas" (
    "id" SERIAL NOT NULL,
    "headerConfigId" INTEGER NOT NULL,
    "ctaId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_ctas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_page_hero" (
    "id" SERIAL NOT NULL,
    "tagline" TEXT,
    "headline" TEXT NOT NULL,
    "subheading" TEXT,
    "ctaPrimaryId" INTEGER,
    "ctaSecondaryId" INTEGER,
    "ctaPrimaryText" TEXT,
    "ctaPrimaryUrl" TEXT,
    "ctaSecondaryText" TEXT,
    "ctaSecondaryUrl" TEXT,
    "mediaUrl" TEXT,
    "backgroundColor" TEXT DEFAULT '#FFFFFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_page_hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_indicators" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "url" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_features" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layoutType" TEXT NOT NULL DEFAULT 'grid',
    "backgroundColor" TEXT DEFAULT '#FFFFFF',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_group_items" (
    "id" SERIAL NOT NULL,
    "featureGroupId" INTEGER NOT NULL,
    "featureId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_group_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_feature_groups" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "featureGroupId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_feature_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "sectionType" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "heroSectionId" INTEGER,
    "featureGroupId" INTEGER,
    "mediaSectionId" INTEGER,
    "pricingSectionId" INTEGER,
    "faqSectionId" INTEGER,
    "faqCategoryId" INTEGER,
    "contactSectionId" INTEGER,
    "formId" INTEGER,
    "htmlSectionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scriptSectionId" INTEGER,
    "headerSectionId" INTEGER,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "avatarUrl" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#5243E9',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT,
    "searchPlaceholder" TEXT NOT NULL DEFAULT 'Enter your keyword here',
    "showHero" BOOLEAN NOT NULL DEFAULT true,
    "showCategories" BOOLEAN NOT NULL DEFAULT true,
    "backgroundColor" TEXT NOT NULL DEFAULT '#f8fafc',
    "heroBackgroundColor" TEXT NOT NULL DEFAULT '#6366f1',
    "heroHeight" TEXT NOT NULL DEFAULT '80vh',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_section_categories" (
    "id" SERIAL NOT NULL,
    "faqSectionId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_section_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "successMessage" TEXT NOT NULL DEFAULT 'Thank you for your message! We''ll get back to you soon.',
    "errorMessage" TEXT NOT NULL DEFAULT 'Sorry, there was an error sending your message. Please try again.',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_fields" (
    "id" SERIAL NOT NULL,
    "contactSectionId" INTEGER NOT NULL,
    "fieldType" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "helpText" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "fieldOptions" TEXT,
    "fieldWidth" TEXT NOT NULL DEFAULT 'full',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_email_settings" (
    "id" SERIAL NOT NULL,
    "contactSectionId" INTEGER NOT NULL,
    "smtpHost" TEXT NOT NULL,
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpUsername" TEXT NOT NULL,
    "smtpPassword" TEXT NOT NULL,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "ccEmail" TEXT,
    "bccEmail" TEXT,
    "replyToEmail" TEXT,
    "emailSubject" TEXT NOT NULL DEFAULT 'New Contact Form Submission',
    "emailTemplate" TEXT,
    "autoRespond" BOOLEAN NOT NULL DEFAULT false,
    "autoRespondSubject" TEXT,
    "autoRespondTemplate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_email_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" SERIAL NOT NULL,
    "contactSectionId" INTEGER NOT NULL,
    "formData" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isSpam" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ctaText" TEXT DEFAULT 'Get Started',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_cycles" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_pricing" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "billingCycleId" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "stripePriceId" TEXT,
    "ctaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_feature_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "iconUrl" TEXT,
    "dataType" TEXT NOT NULL DEFAULT 'number',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_feature_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_feature_limits" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "featureTypeId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isUnlimited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_feature_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_features" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "featureId" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_library" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "alt" TEXT,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "originalUrl" TEXT NOT NULL,
    "localPath" TEXT,
    "publicUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "folderId" INTEGER,
    "tags" TEXT,
    "uploadSource" TEXT NOT NULL DEFAULT 'upload',
    "uploadedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_folders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "color" TEXT NOT NULL DEFAULT '#5243E9',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_usage" (
    "id" SERIAL NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "fieldName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basic_features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basic_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_basic_features" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "basicFeatureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_basic_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "layoutType" TEXT NOT NULL DEFAULT 'standard',
    "pricingCardsBackgroundColor" TEXT DEFAULT '#FFFFFF',
    "comparisonTableBackgroundColor" TEXT DEFAULT '#F9FAFB',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_section_plans" (
    "id" SERIAL NOT NULL,
    "pricingSectionId" INTEGER NOT NULL,
    "planId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_section_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_pricing_sections" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "pricingSectionId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_pricing_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subheading" TEXT,
    "successMessage" TEXT NOT NULL DEFAULT 'Thank you! Your message has been sent successfully.',
    "errorMessage" TEXT NOT NULL DEFAULT 'Sorry, there was an error. Please try again.',
    "ctaText" TEXT NOT NULL DEFAULT 'Send Message',
    "ctaIcon" TEXT,
    "ctaStyle" TEXT NOT NULL DEFAULT 'primary',
    "ctaSize" TEXT NOT NULL DEFAULT 'large',
    "ctaWidth" TEXT NOT NULL DEFAULT 'auto',
    "ctaLoadingText" TEXT NOT NULL DEFAULT 'Sending...',
    "ctaBackgroundColor" TEXT,
    "ctaTextColor" TEXT,
    "ctaBorderColor" TEXT,
    "ctaHoverBackgroundColor" TEXT,
    "ctaHoverTextColor" TEXT,
    "redirectUrl" TEXT,
    "emailNotification" BOOLEAN NOT NULL DEFAULT false,
    "emailRecipients" TEXT,
    "dynamicEmailRecipients" BOOLEAN NOT NULL DEFAULT false,
    "emailFieldRecipients" TEXT,
    "sendToSubmitterEmail" BOOLEAN NOT NULL DEFAULT false,
    "submitterEmailField" TEXT,
    "adminEmailSubject" TEXT NOT NULL DEFAULT 'New Form Submission',
    "adminEmailTemplate" TEXT NOT NULL DEFAULT 'You have received a new form submission.

{{FORM_DATA}}

Submitted at: {{SUBMITTED_AT}}',
    "submitterEmailSubject" TEXT NOT NULL DEFAULT 'Thank you for your submission',
    "submitterEmailTemplate" TEXT NOT NULL DEFAULT 'Dear {{SUBMITTER_NAME}},

Thank you for contacting us! We have received your message and will get back to you soon.

Best regards,
The Team',
    "webhookUrl" TEXT,
    "enableCaptcha" BOOLEAN NOT NULL DEFAULT true,
    "captchaType" TEXT NOT NULL DEFAULT 'math',
    "captchaDifficulty" TEXT NOT NULL DEFAULT 'medium',
    "showContactInfo" BOOLEAN NOT NULL DEFAULT false,
    "contactPosition" TEXT NOT NULL DEFAULT 'right',
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "contactAddress" TEXT,
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "socialLinkedin" TEXT,
    "socialInstagram" TEXT,
    "socialYoutube" TEXT,
    "contactHeading" TEXT NOT NULL DEFAULT 'Get in Touch',
    "contactSubheading" TEXT NOT NULL DEFAULT 'We''d love to hear from you. Here''s how you can reach us.',
    "contactPhoneLabel" TEXT NOT NULL DEFAULT 'Phone',
    "contactEmailLabel" TEXT NOT NULL DEFAULT 'Email',
    "contactAddressLabel" TEXT NOT NULL DEFAULT 'Address',
    "contactSocialLabel" TEXT NOT NULL DEFAULT 'Follow Us',
    "formBackgroundColor" TEXT,
    "formBorderColor" TEXT NOT NULL DEFAULT 'transparent',
    "formTextColor" TEXT,
    "fieldBackgroundColor" TEXT,
    "fieldBorderColor" TEXT,
    "fieldTextColor" TEXT,
    "sectionBackgroundColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "newsletterAction" BOOLEAN NOT NULL DEFAULT false,
    "newsletterEmailField" TEXT,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "fieldType" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "helpText" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "fieldOptions" TEXT,
    "fieldWidth" TEXT NOT NULL DEFAULT 'full',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "formData" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isSpam" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "emailStatus" TEXT NOT NULL DEFAULT 'not_configured',
    "emailMessageId" TEXT,
    "emailRecipients" TEXT,
    "emailSubject" TEXT,
    "emailSentAt" TIMESTAMP(3),
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "html_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "htmlContent" TEXT NOT NULL,
    "cssContent" TEXT,
    "jsContent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "html_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_html_sections" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "htmlSectionId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_html_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "script_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scriptType" TEXT NOT NULL DEFAULT 'javascript',
    "scriptContent" TEXT NOT NULL,
    "placement" TEXT NOT NULL DEFAULT 'footer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "loadAsync" BOOLEAN NOT NULL DEFAULT false,
    "loadDefer" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "script_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "subscribed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "menuTextColor" TEXT DEFAULT '#374151',
    "menuHoverColor" TEXT DEFAULT '#5243E9',
    "menuActiveColor" TEXT DEFAULT '#5243E9',
    "isSticky" BOOLEAN NOT NULL DEFAULT true,
    "showLogo" BOOLEAN NOT NULL DEFAULT true,
    "showNavigation" BOOLEAN NOT NULL DEFAULT true,
    "showCTAs" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HeaderConfigMenu_headerConfigId_menuId_key" ON "HeaderConfigMenu"("headerConfigId", "menuId");

-- CreateIndex
CREATE UNIQUE INDEX "feature_group_items_featureGroupId_featureId_key" ON "feature_group_items"("featureGroupId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "page_feature_groups_pageId_featureGroupId_key" ON "page_feature_groups"("pageId", "featureGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "faq_sections_name_key" ON "faq_sections"("name");

-- CreateIndex
CREATE UNIQUE INDEX "faq_section_categories_faqSectionId_categoryId_key" ON "faq_section_categories"("faqSectionId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_email_settings_contactSectionId_key" ON "contact_email_settings"("contactSectionId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_pricing_planId_billingCycleId_key" ON "plan_pricing"("planId", "billingCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_feature_limits_planId_featureTypeId_key" ON "plan_feature_limits"("planId", "featureTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "media_usage_mediaId_entityType_entityId_fieldName_key" ON "media_usage"("mediaId", "entityType", "entityId", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "plan_basic_features_planId_basicFeatureId_key" ON "plan_basic_features"("planId", "basicFeatureId");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_section_plans_pricingSectionId_planId_key" ON "pricing_section_plans"("pricingSectionId", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "page_pricing_sections_pageId_pricingSectionId_key" ON "page_pricing_sections"("pageId", "pricingSectionId");

-- CreateIndex
CREATE UNIQUE INDEX "page_html_sections_pageId_htmlSectionId_key" ON "page_html_sections"("pageId", "htmlSectionId");

-- CreateIndex
CREATE UNIQUE INDEX "script_sections_name_key" ON "script_sections"("name");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- AddForeignKey
ALTER TABLE "hero_sections" ADD CONSTRAINT "hero_sections_ctaPrimaryId_fkey" FOREIGN KEY ("ctaPrimaryId") REFERENCES "ctas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_sections" ADD CONSTRAINT "hero_sections_ctaSecondaryId_fkey" FOREIGN KEY ("ctaSecondaryId") REFERENCES "ctas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_section_features" ADD CONSTRAINT "media_section_features_mediaSectionId_fkey" FOREIGN KEY ("mediaSectionId") REFERENCES "media_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeaderConfigMenu" ADD CONSTRAINT "HeaderConfigMenu_headerConfigId_fkey" FOREIGN KEY ("headerConfigId") REFERENCES "header_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeaderConfigMenu" ADD CONSTRAINT "HeaderConfigMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_headerConfigId_fkey" FOREIGN KEY ("headerConfigId") REFERENCES "header_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_ctas" ADD CONSTRAINT "header_ctas_ctaId_fkey" FOREIGN KEY ("ctaId") REFERENCES "ctas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_ctas" ADD CONSTRAINT "header_ctas_headerConfigId_fkey" FOREIGN KEY ("headerConfigId") REFERENCES "header_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_page_hero" ADD CONSTRAINT "home_page_hero_ctaPrimaryId_fkey" FOREIGN KEY ("ctaPrimaryId") REFERENCES "ctas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_page_hero" ADD CONSTRAINT "home_page_hero_ctaSecondaryId_fkey" FOREIGN KEY ("ctaSecondaryId") REFERENCES "ctas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_group_items" ADD CONSTRAINT "feature_group_items_featureGroupId_fkey" FOREIGN KEY ("featureGroupId") REFERENCES "feature_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_group_items" ADD CONSTRAINT "feature_group_items_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "global_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_feature_groups" ADD CONSTRAINT "page_feature_groups_featureGroupId_fkey" FOREIGN KEY ("featureGroupId") REFERENCES "feature_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_feature_groups" ADD CONSTRAINT "page_feature_groups_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_contactSectionId_fkey" FOREIGN KEY ("contactSectionId") REFERENCES "contact_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_faqCategoryId_fkey" FOREIGN KEY ("faqCategoryId") REFERENCES "faq_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_faqSectionId_fkey" FOREIGN KEY ("faqSectionId") REFERENCES "faq_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_featureGroupId_fkey" FOREIGN KEY ("featureGroupId") REFERENCES "feature_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_headerSectionId_fkey" FOREIGN KEY ("headerSectionId") REFERENCES "header_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_heroSectionId_fkey" FOREIGN KEY ("heroSectionId") REFERENCES "hero_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_htmlSectionId_fkey" FOREIGN KEY ("htmlSectionId") REFERENCES "html_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_mediaSectionId_fkey" FOREIGN KEY ("mediaSectionId") REFERENCES "media_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_pricingSectionId_fkey" FOREIGN KEY ("pricingSectionId") REFERENCES "pricing_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_scriptSectionId_fkey" FOREIGN KEY ("scriptSectionId") REFERENCES "script_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "faq_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_section_categories" ADD CONSTRAINT "faq_section_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "faq_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_section_categories" ADD CONSTRAINT "faq_section_categories_faqSectionId_fkey" FOREIGN KEY ("faqSectionId") REFERENCES "faq_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_fields" ADD CONSTRAINT "contact_fields_contactSectionId_fkey" FOREIGN KEY ("contactSectionId") REFERENCES "contact_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_email_settings" ADD CONSTRAINT "contact_email_settings_contactSectionId_fkey" FOREIGN KEY ("contactSectionId") REFERENCES "contact_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_contactSectionId_fkey" FOREIGN KEY ("contactSectionId") REFERENCES "contact_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_pricing" ADD CONSTRAINT "plan_pricing_billingCycleId_fkey" FOREIGN KEY ("billingCycleId") REFERENCES "billing_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_pricing" ADD CONSTRAINT "plan_pricing_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_feature_limits" ADD CONSTRAINT "plan_feature_limits_featureTypeId_fkey" FOREIGN KEY ("featureTypeId") REFERENCES "plan_feature_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_feature_limits" ADD CONSTRAINT "plan_feature_limits_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "shared_features"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_usage" ADD CONSTRAINT "media_usage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_basic_features" ADD CONSTRAINT "plan_basic_features_basicFeatureId_fkey" FOREIGN KEY ("basicFeatureId") REFERENCES "basic_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_basic_features" ADD CONSTRAINT "plan_basic_features_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_section_plans" ADD CONSTRAINT "pricing_section_plans_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_section_plans" ADD CONSTRAINT "pricing_section_plans_pricingSectionId_fkey" FOREIGN KEY ("pricingSectionId") REFERENCES "pricing_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_pricing_sections" ADD CONSTRAINT "page_pricing_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_pricing_sections" ADD CONSTRAINT "page_pricing_sections_pricingSectionId_fkey" FOREIGN KEY ("pricingSectionId") REFERENCES "pricing_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_html_sections" ADD CONSTRAINT "page_html_sections_htmlSectionId_fkey" FOREIGN KEY ("htmlSectionId") REFERENCES "html_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_html_sections" ADD CONSTRAINT "page_html_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

