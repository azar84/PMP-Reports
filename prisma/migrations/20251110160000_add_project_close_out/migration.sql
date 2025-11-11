-- CreateTable
CREATE TABLE "project_close_out_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "itemType" TEXT NOT NULL,
    "totalRequired" INTEGER,
    "submitted" INTEGER,
    "approved" INTEGER,
    "underReview" INTEGER,
    "rejected" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_close_out_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "project_close_out_entries_projectId_idx" ON "project_close_out_entries"("projectId");

-- CreateIndex
CREATE INDEX "project_close_out_entries_sortOrder_idx" ON "project_close_out_entries"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "project_close_out_entries_projectId_itemType_key" ON "project_close_out_entries"("projectId", "itemType");
