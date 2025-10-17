-- AlterTable
ALTER TABLE "hero_sections" ADD COLUMN     "backgroundImage" TEXT,
ADD COLUMN     "backgroundOverlay" TEXT,
ADD COLUMN     "backgroundSize" TEXT NOT NULL DEFAULT 'cover';

-- AlterTable
ALTER TABLE "home_page_hero" ADD COLUMN     "backgroundImage" TEXT,
ADD COLUMN     "backgroundOverlay" TEXT,
ADD COLUMN     "backgroundSize" TEXT NOT NULL DEFAULT 'cover';
