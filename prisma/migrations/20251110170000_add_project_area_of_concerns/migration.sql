-- Create Project Area of Concerns table
CREATE TABLE "project_area_of_concerns" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "actionNeeded" TEXT,
    "startedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Ongoing',
    "remarks" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_area_of_concerns_projectId_fkey"
        FOREIGN KEY ("projectId")
        REFERENCES "projects" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "project_area_of_concerns_projectId_idx"
    ON "project_area_of_concerns"("projectId");

