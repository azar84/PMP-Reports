-- CreateTable
CREATE TABLE "project_quality_checklist_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "submissionType" TEXT NOT NULL,
    "submitted" INTEGER,
    "approved" INTEGER,
    "underReview" INTEGER,
    "rejected" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_quality_checklist_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "project_quality_checklist_entries_projectId_submissionType_key" ON "project_quality_checklist_entries" ("projectId", "submissionType");

-- CreateIndex
CREATE INDEX "project_quality_checklist_entries_projectId_idx" ON "project_quality_checklist_entries" ("projectId");

-- CreateIndex
CREATE INDEX "project_quality_checklist_entries_sortOrder_idx" ON "project_quality_checklist_entries" ("sortOrder");

