/*
  Warnings:

  - You are about to drop the column `projectDirectorId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `projectManagerId` on the `projects` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_project_staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "staffId" INTEGER,
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
INSERT INTO "new_project_staff" ("createdAt", "designation", "endDate", "id", "notes", "projectId", "staffId", "startDate", "status", "updatedAt", "utilization") SELECT "createdAt", "designation", "endDate", "id", "notes", "projectId", "staffId", "startDate", "status", "updatedAt", "utilization" FROM "project_staff";
DROP TABLE "project_staff";
ALTER TABLE "new_project_staff" RENAME TO "project_staff";
CREATE UNIQUE INDEX "project_staff_projectId_staffId_designation_key" ON "project_staff"("projectId", "staffId", "designation");
CREATE TABLE "new_projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectCode" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectDescription" TEXT,
    "clientId" INTEGER,
    "projectManagementConsultantId" INTEGER,
    "designConsultantId" INTEGER,
    "supervisionConsultantId" INTEGER,
    "costConsultantId" INTEGER,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "duration" TEXT,
    "eot" TEXT,
    "projectValue" DECIMAL,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_projectManagementConsultantId_fkey" FOREIGN KEY ("projectManagementConsultantId") REFERENCES "consultants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_designConsultantId_fkey" FOREIGN KEY ("designConsultantId") REFERENCES "consultants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_supervisionConsultantId_fkey" FOREIGN KEY ("supervisionConsultantId") REFERENCES "consultants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_costConsultantId_fkey" FOREIGN KEY ("costConsultantId") REFERENCES "consultants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_projects" ("clientId", "costConsultantId", "createdAt", "designConsultantId", "duration", "endDate", "eot", "id", "lastUpdate", "projectCode", "projectDescription", "projectManagementConsultantId", "projectName", "projectValue", "startDate", "supervisionConsultantId", "updatedAt") SELECT "clientId", "costConsultantId", "createdAt", "designConsultantId", "duration", "endDate", "eot", "id", "lastUpdate", "projectCode", "projectDescription", "projectManagementConsultantId", "projectName", "projectValue", "startDate", "supervisionConsultantId", "updatedAt" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
CREATE UNIQUE INDEX "projects_projectCode_key" ON "projects"("projectCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
