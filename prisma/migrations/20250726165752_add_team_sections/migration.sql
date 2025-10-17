-- AlterTable
ALTER TABLE "page_sections" ADD COLUMN     "teamSectionId" INTEGER;

-- CreateTable
CREATE TABLE "team_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "layoutType" TEXT NOT NULL DEFAULT 'grid',
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "textColor" TEXT DEFAULT '#000000',
    "headingColor" TEXT DEFAULT '#000000',
    "subheadingColor" TEXT DEFAULT '#666666',
    "paddingTop" INTEGER NOT NULL DEFAULT 96,
    "paddingBottom" INTEGER NOT NULL DEFAULT 96,
    "containerMaxWidth" TEXT NOT NULL DEFAULT 'xl',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" SERIAL NOT NULL,
    "teamSectionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "bio" TEXT,
    "photoUrl" TEXT,
    "photoAlt" TEXT,
    "email" TEXT,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "githubUrl" TEXT,
    "websiteUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_teamSectionId_fkey" FOREIGN KEY ("teamSectionId") REFERENCES "team_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamSectionId_fkey" FOREIGN KEY ("teamSectionId") REFERENCES "team_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
