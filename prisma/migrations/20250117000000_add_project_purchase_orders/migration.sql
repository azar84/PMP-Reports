-- CreateTable
CREATE TABLE "project_purchase_orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "projectSupplierId" INTEGER NOT NULL,
    "lpoNumber" TEXT NOT NULL,
    "lpoDate" DATETIME NOT NULL,
    "lpoValue" DECIMAL NOT NULL,
    "vatPercent" DECIMAL NOT NULL DEFAULT 5.0,
    "lpoValueWithVat" DECIMAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_purchase_orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE,
    CONSTRAINT "project_purchase_orders_projectSupplierId_fkey" FOREIGN KEY ("projectSupplierId") REFERENCES "project_suppliers" ("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX "project_purchase_orders_projectId_idx" ON "project_purchase_orders"("projectId");

-- CreateIndex
CREATE INDEX "project_purchase_orders_projectSupplierId_idx" ON "project_purchase_orders"("projectSupplierId");

-- CreateIndex
CREATE UNIQUE INDEX "project_purchase_orders_projectId_projectSupplierId_lpoNumber_key" ON "project_purchase_orders"("projectId", "projectSupplierId", "lpoNumber");

