/*
  Warnings:

  - You are about to drop the column `textColor` on the `team_sections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "team_members" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "team_sections" DROP COLUMN "textColor";
