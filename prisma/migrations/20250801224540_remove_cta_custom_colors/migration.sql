/*
  Warnings:

  - You are about to drop the column `ctaPrimaryBgColor` on the `hero_sections` table. All the data in the column will be lost.
  - You are about to drop the column `ctaPrimaryTextColor` on the `hero_sections` table. All the data in the column will be lost.
  - You are about to drop the column `ctaSecondaryBgColor` on the `hero_sections` table. All the data in the column will be lost.
  - You are about to drop the column `ctaSecondaryTextColor` on the `hero_sections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "hero_sections" DROP COLUMN "ctaPrimaryBgColor",
DROP COLUMN "ctaPrimaryTextColor",
DROP COLUMN "ctaSecondaryBgColor",
DROP COLUMN "ctaSecondaryTextColor";
