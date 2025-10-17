/*
  Warnings:

  - You are about to drop the column `backgroundImage` on the `team_sections` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundOverlay` on the `team_sections` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundSize` on the `team_sections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "team_sections" DROP COLUMN "backgroundImage",
DROP COLUMN "backgroundOverlay",
DROP COLUMN "backgroundSize";
