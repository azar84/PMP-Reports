-- CreateTable
CREATE TABLE "project_quality_e2_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "submissionType" TEXT NOT NULL,
    "totalNumber" INTEGER,
    "submitted" INTEGER,
    "underReview" INTEGER,
    "approved" INTEGER,
    "reviseAndResubmit" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_quality_e2_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "project_quality_e2_logs_projectId_submissionType_key" ON "project_quality_e2_logs" ("projectId", "submissionType");

-- CreateIndex
CREATE INDEX "project_quality_e2_logs_projectId_idx" ON "project_quality_e2_logs" ("projectId");

-- CreateIndex
CREATE INDEX "project_quality_e2_logs_sortOrder_idx" ON "project_quality_e2_logs" ("sortOrder");

