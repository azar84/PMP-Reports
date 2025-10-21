-- AlterTable
ALTER TABLE "projects" ADD COLUMN "projectValue" DECIMAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_project_contacts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_contacts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_contacts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_project_contacts" ("contactId", "createdAt", "id", "isPrimary", "projectId", "updatedAt") SELECT "contactId", "createdAt", "id", "isPrimary", "projectId", "updatedAt" FROM "project_contacts";
DROP TABLE "project_contacts";
ALTER TABLE "new_project_contacts" RENAME TO "project_contacts";
CREATE UNIQUE INDEX "project_contacts_projectId_contactId_key" ON "project_contacts"("projectId", "contactId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
