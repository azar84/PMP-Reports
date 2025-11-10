-- Create HSE checklist table
CREATE TABLE "project_hse_checklist_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "plannedDate" DATETIME,
    "actualDate" DATETIME,
    "status" TEXT,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_hse_checklist_items_projectId_fkey"
        FOREIGN KEY ("projectId")
        REFERENCES "projects" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "project_hse_checklist_items_projectId_idx"
    ON "project_hse_checklist_items"("projectId");

-- Create NOC tracker table
CREATE TABLE "project_noc_tracker_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "nocNumber" TEXT,
    "permitType" TEXT,
    "plannedSubmissionDate" DATETIME,
    "actualSubmissionDate" DATETIME,
    "status" TEXT,
    "expiryDate" DATETIME,
    "remarks" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_noc_tracker_entries_projectId_fkey"
        FOREIGN KEY ("projectId")
        REFERENCES "projects" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "project_noc_tracker_entries_projectId_idx"
    ON "project_noc_tracker_entries"("projectId");

