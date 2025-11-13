-- CreateTable
CREATE TABLE "project_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reportMonth" INTEGER NOT NULL,
    "reportYear" INTEGER NOT NULL,
    "reportData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "project_reports_projectId_reportMonth_reportYear_key" ON "project_reports"("projectId", "reportMonth", "reportYear");

-- CreateIndex
CREATE INDEX "project_reports_projectId_idx" ON "project_reports"("projectId");

-- CreateIndex
CREATE INDEX "project_reports_userId_idx" ON "project_reports"("userId");

-- CreateIndex
CREATE INDEX "project_reports_reportYear_reportMonth_idx" ON "project_reports"("reportYear", "reportMonth");

