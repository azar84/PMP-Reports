-- CreateTable
CREATE TABLE "project_checklist_items" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_checklist_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
