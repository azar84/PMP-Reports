-- Create Project Commercial table
CREATE TABLE "project_commercial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL UNIQUE,
    "contractValue" DECIMAL,
    "provisionalSum" DECIMAL,
    "instructedProvisionalSum" DECIMAL,
    "variations" DECIMAL,
    "omission" DECIMAL,
    "dayworks" DECIMAL,
    "preliminaries" DECIMAL,
    "subContractors" DECIMAL,
    "suppliersMaterial" DECIMAL,
    "machinery" DECIMAL,
    "labors" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_commercial_projectId_fkey"
        FOREIGN KEY ("projectId")
        REFERENCES "projects" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "project_commercial_projectId_idx"
    ON "project_commercial"("projectId");

