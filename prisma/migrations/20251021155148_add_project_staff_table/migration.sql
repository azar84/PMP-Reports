-- CreateTable
CREATE TABLE "project_staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "designation" TEXT NOT NULL,
    "utilization" INTEGER NOT NULL DEFAULT 100,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_staff_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_staff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "company_staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "project_staff_projectId_staffId_designation_key" ON "project_staff"("projectId", "staffId", "designation");

-- Migrate existing project director and manager data
INSERT INTO "project_staff" ("projectId", "staffId", "designation", "utilization", "status", "createdAt", "updatedAt")
SELECT 
    "id" as "projectId",
    "projectDirectorId" as "staffId",
    'Project Director' as "designation",
    100 as "utilization",
    'Active' as "status",
    "createdAt",
    "updatedAt"
FROM "projects" 
WHERE "projectDirectorId" IS NOT NULL;

INSERT INTO "project_staff" ("projectId", "staffId", "designation", "utilization", "status", "createdAt", "updatedAt")
SELECT 
    "id" as "projectId",
    "projectManagerId" as "staffId",
    'Project Manager' as "designation",
    100 as "utilization",
    'Active' as "status",
    "createdAt",
    "updatedAt"
FROM "projects" 
WHERE "projectManagerId" IS NOT NULL;
