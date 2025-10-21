-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_project_checklist_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "itemNumber" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "plannedDate" DATETIME,
    "actualDate" DATETIME,
    "status" TEXT,
    "notes" TEXT,
    "isSubItem" BOOLEAN NOT NULL DEFAULT false,
    "parentItemId" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_checklist_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_project_checklist_items" ("actualDate", "createdAt", "id", "isSubItem", "itemNumber", "notes", "parentItemId", "phase", "plannedDate", "projectId", "status", "updatedAt") SELECT "actualDate", "createdAt", "id", "isSubItem", "itemNumber", "notes", "parentItemId", "phase", "plannedDate", "projectId", "status", "updatedAt" FROM "project_checklist_items";
DROP TABLE "project_checklist_items";
ALTER TABLE "new_project_checklist_items" RENAME TO "project_checklist_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
