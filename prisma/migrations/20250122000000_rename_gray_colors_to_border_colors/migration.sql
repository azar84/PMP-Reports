-- Migration: Rename gray colors to border colors
-- This migration renames grayLight, grayMedium, grayDark to borderLight, borderStrong

-- Add new columns
ALTER TABLE "design_system" ADD COLUMN "borderLight" TEXT DEFAULT '#F9FAFB';
ALTER TABLE "design_system" ADD COLUMN "borderStrong" TEXT DEFAULT '#374151';

-- Copy data from old columns to new columns
UPDATE "design_system" SET 
  "borderLight" = "grayLight",
  "borderStrong" = "grayDark";

-- Drop old columns
ALTER TABLE "design_system" DROP COLUMN "grayLight";
ALTER TABLE "design_system" DROP COLUMN "grayMedium";
ALTER TABLE "design_system" DROP COLUMN "grayDark";
