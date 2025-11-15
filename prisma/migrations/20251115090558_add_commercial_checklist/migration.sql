-- Create Project Commercial Checklist Items table
CREATE TABLE "project_commercial_checklist_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "checkListItem" TEXT NOT NULL,
    "yesNo" TEXT,
    "status" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_commercial_checklist_items_projectId_fkey"
        FOREIGN KEY ("projectId")
        REFERENCES "projects" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "project_commercial_checklist_items_projectId_idx"
    ON "project_commercial_checklist_items"("projectId");

CREATE INDEX "project_commercial_checklist_items_sortOrder_idx"
    ON "project_commercial_checklist_items"("sortOrder");

