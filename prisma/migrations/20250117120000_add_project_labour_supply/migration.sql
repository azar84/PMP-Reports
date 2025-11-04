-- CreateTable
CREATE TABLE "project_labour_supplies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "trade" TEXT NOT NULL,
    "numberOfLabour" INTEGER NOT NULL,
    "pricePerHour" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_labour_supplies_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "project_labour_supplies_projectId_trade_key" ON "project_labour_supplies"("projectId", "trade");

-- CreateIndex
CREATE INDEX "project_labour_supplies_projectId_idx" ON "project_labour_supplies"("projectId");
