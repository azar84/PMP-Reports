-- Add color fields to HomePageHero table
ALTER TABLE "home_page_hero" ADD COLUMN "headingColor" TEXT DEFAULT '#1F2937';
ALTER TABLE "home_page_hero" ADD COLUMN "subheadingColor" TEXT DEFAULT '#6B7280';
ALTER TABLE "home_page_hero" ADD COLUMN "trustIndicatorTextColor" TEXT DEFAULT '#6B7280';
ALTER TABLE "home_page_hero" ADD COLUMN "trustIndicatorBackgroundColor" TEXT DEFAULT '#F9FAFB'; 