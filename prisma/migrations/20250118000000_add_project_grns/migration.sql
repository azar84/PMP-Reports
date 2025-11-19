-- CreateTable
CREATE TABLE "project_grns" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "projectSupplierId" INTEGER NOT NULL,
    "purchaseOrderId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" DATETIME NOT NULL,
    "grnRefNo" TEXT NOT NULL,
    "grnDate" DATETIME NOT NULL,
    "advancePayment" DECIMAL DEFAULT 0,
    "deliveredAmount" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    CONSTRAINT "project_grns_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "project_purchase_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_grns_projectSupplierId_fkey" FOREIGN KEY ("projectSupplierId") REFERENCES "project_suppliers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_grns_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "project_grns_projectId_idx" ON "project_grns"("projectId");

-- CreateIndex
CREATE INDEX "project_grns_projectSupplierId_idx" ON "project_grns"("projectSupplierId");

-- CreateIndex
CREATE INDEX "project_grns_purchaseOrderId_idx" ON "project_grns"("purchaseOrderId");

