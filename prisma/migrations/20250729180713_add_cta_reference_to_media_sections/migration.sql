/*
  Warnings:

  - You are about to drop the column `ctaStyle` on the `media_sections` table. All the data in the column will be lost.
  - You are about to drop the column `ctaText` on the `media_sections` table. All the data in the column will be lost.
  - You are about to drop the column `ctaUrl` on the `media_sections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "media_sections" DROP COLUMN "ctaStyle",
DROP COLUMN "ctaText",
DROP COLUMN "ctaUrl",
ADD COLUMN     "ctaId" INTEGER;

-- AddForeignKey
ALTER TABLE "media_sections" ADD CONSTRAINT "media_sections_ctaId_fkey" FOREIGN KEY ("ctaId") REFERENCES "ctas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
