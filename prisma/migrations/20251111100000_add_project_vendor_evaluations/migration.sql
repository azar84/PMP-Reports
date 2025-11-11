CREATE TABLE "project_vendor_evaluations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_vendor_evaluations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_vendor_evaluations_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "project_vendor_evaluations_projectId_supplierId_key"
    ON "project_vendor_evaluations"("projectId", "supplierId");

CREATE INDEX "project_vendor_evaluations_projectId_idx"
    ON "project_vendor_evaluations"("projectId");

CREATE INDEX "project_vendor_evaluations_supplierId_idx"
    ON "project_vendor_evaluations"("supplierId");
