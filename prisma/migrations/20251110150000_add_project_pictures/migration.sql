-- CreateTable
CREATE TABLE "project_pictures" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_pictures_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_pictures_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "project_pictures_projectId_idx" ON "project_pictures"("projectId");

-- CreateIndex
CREATE INDEX "project_pictures_mediaId_idx" ON "project_pictures"("mediaId");
