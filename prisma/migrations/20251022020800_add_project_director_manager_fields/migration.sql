-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "projectDirectorId" INTEGER,
    "projectManagerId" INTEGER,
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
    CONSTRAINT "projects_costConsultantId_fkey" FOREIGN KEY ("costConsultantId") REFERENCES "consultants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_projectDirectorId_fkey" FOREIGN KEY ("projectDirectorId") REFERENCES "company_staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "company_staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_projects" ("clientId", "costConsultantId", "createdAt", "designConsultantId", "duration", "endDate", "eot", "id", "lastUpdate", "projectCode", "projectDescription", "projectManagementConsultantId", "projectName", "projectValue", "startDate", "supervisionConsultantId", "updatedAt") SELECT "clientId", "costConsultantId", "createdAt", "designConsultantId", "duration", "endDate", "eot", "id", "lastUpdate", "projectCode", "projectDescription", "projectManagementConsultantId", "projectName", "projectValue", "startDate", "supervisionConsultantId", "updatedAt" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
CREATE UNIQUE INDEX "projects_projectCode_key" ON "projects"("projectCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
