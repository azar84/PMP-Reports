-- AlterTable
ALTER TABLE "team_sections" ADD COLUMN     "backgroundImage" TEXT,
ADD COLUMN     "backgroundOverlay" TEXT,
ADD COLUMN     "backgroundSize" TEXT DEFAULT 'cover';
