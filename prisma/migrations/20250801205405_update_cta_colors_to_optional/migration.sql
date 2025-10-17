-- AlterTable
ALTER TABLE "hero_sections" ALTER COLUMN "ctaPrimaryBgColor" DROP NOT NULL,
ALTER COLUMN "ctaPrimaryBgColor" DROP DEFAULT,
ALTER COLUMN "ctaPrimaryTextColor" DROP NOT NULL,
ALTER COLUMN "ctaPrimaryTextColor" DROP DEFAULT,
ALTER COLUMN "ctaSecondaryBgColor" DROP NOT NULL,
ALTER COLUMN "ctaSecondaryBgColor" DROP DEFAULT,
ALTER COLUMN "ctaSecondaryTextColor" DROP NOT NULL,
ALTER COLUMN "ctaSecondaryTextColor" DROP DEFAULT;
