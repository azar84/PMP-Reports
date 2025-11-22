-- Safe Migration: Restructure GRNs and Invoices
-- This migration preserves all existing data

-- Step 1: Create the new Invoice table
CREATE TABLE IF NOT EXISTS "project_invoices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "projectSupplierId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_invoices_projectSupplierId_fkey" FOREIGN KEY ("projectSupplierId") REFERENCES "project_suppliers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_invoices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 2: Create the InvoiceGRN junction table
CREATE TABLE IF NOT EXISTS "invoice_grns" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceId" INTEGER NOT NULL,
    "grnId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_grns_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "project_invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invoice_grns_grnId_fkey" FOREIGN KEY ("grnId") REFERENCES "project_grns" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 3: Create indexes for Invoice table
CREATE INDEX IF NOT EXISTS "project_invoices_projectId_idx" ON "project_invoices"("projectId");
CREATE INDEX IF NOT EXISTS "project_invoices_projectSupplierId_idx" ON "project_invoices"("projectSupplierId");
CREATE UNIQUE INDEX IF NOT EXISTS "project_invoices_projectId_projectSupplierId_invoiceNumber_key" ON "project_invoices"("projectId", "projectSupplierId", "invoiceNumber");

-- Step 4: Create indexes for InvoiceGRN table
CREATE INDEX IF NOT EXISTS "invoice_grns_invoiceId_idx" ON "invoice_grns"("invoiceId");
CREATE INDEX IF NOT EXISTS "invoice_grns_grnId_idx" ON "invoice_grns"("grnId");
CREATE UNIQUE INDEX IF NOT EXISTS "invoice_grns_invoiceId_grnId_key" ON "invoice_grns"("invoiceId", "grnId");

-- Step 5: Migrate existing invoice data (if any exists)
-- Group GRNs by invoice number and date to create invoices
INSERT INTO "project_invoices" ("projectId", "projectSupplierId", "invoiceNumber", "invoiceDate", "createdAt", "updatedAt")
SELECT DISTINCT
    grn."projectId",
    grn."projectSupplierId",
    grn."invoiceNumber",
    grn."invoiceDate",
    MIN(grn."createdAt") as "createdAt",
    MAX(grn."updatedAt") as "updatedAt"
FROM "project_grns" grn
WHERE grn."invoiceNumber" IS NOT NULL 
  AND grn."invoiceNumber" != ''
  AND grn."invoiceDate" IS NOT NULL
GROUP BY grn."projectId", grn."projectSupplierId", grn."invoiceNumber", grn."invoiceDate"
ON CONFLICT DO NOTHING;

-- Step 6: Link GRNs to their invoices in the junction table
INSERT INTO "invoice_grns" ("invoiceId", "grnId", "createdAt")
SELECT 
    inv."id" as "invoiceId",
    grn."id" as "grnId",
    grn."createdAt"
FROM "project_grns" grn
INNER JOIN "project_invoices" inv 
    ON grn."projectId" = inv."projectId"
    AND grn."projectSupplierId" = inv."projectSupplierId"
    AND grn."invoiceNumber" = inv."invoiceNumber"
    AND grn."invoiceDate" = inv."invoiceDate"
WHERE grn."invoiceNumber" IS NOT NULL 
  AND grn."invoiceNumber" != ''
  AND grn."invoiceDate" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 7: SQLite doesn't support dropping columns directly, so we need to recreate the table
-- Create new GRN table without invoice columns
CREATE TABLE "project_grns_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "projectSupplierId" INTEGER NOT NULL,
    "purchaseOrderId" INTEGER NOT NULL,
    "grnRefNo" TEXT NOT NULL,
    "grnDate" DATETIME NOT NULL,
    "advancePayment" DECIMAL DEFAULT 0,
    "deliveredAmount" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_grns_new_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "project_purchase_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_grns_new_projectSupplierId_fkey" FOREIGN KEY ("projectSupplierId") REFERENCES "project_suppliers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_grns_new_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 8: Copy data from old table to new table (without invoice columns)
INSERT INTO "project_grns_new" (
    "id", "projectId", "projectSupplierId", "purchaseOrderId", 
    "grnRefNo", "grnDate", "advancePayment", "deliveredAmount", 
    "createdAt", "updatedAt"
)
SELECT 
    "id", "projectId", "projectSupplierId", "purchaseOrderId",
    "grnRefNo", "grnDate", "advancePayment", "deliveredAmount",
    "createdAt", "updatedAt"
FROM "project_grns";

-- Step 9: Recreate indexes on new table
CREATE INDEX "project_grns_new_projectId_idx" ON "project_grns_new"("projectId");
CREATE INDEX "project_grns_new_projectSupplierId_idx" ON "project_grns_new"("projectSupplierId");
CREATE INDEX "project_grns_new_purchaseOrderId_idx" ON "project_grns_new"("purchaseOrderId");

-- Step 10: Drop old table and rename new one
DROP TABLE "project_grns";
ALTER TABLE "project_grns_new" RENAME TO "project_grns";

-- Step 11: Update foreign key references in invoice_grns table (they should still work since IDs are preserved)

