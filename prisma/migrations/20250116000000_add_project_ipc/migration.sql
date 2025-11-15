-- Create Project IPC table
CREATE TABLE "project_ipc" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "month" TEXT,
    "grossValueSubmitted" DECIMAL,
    "dateSubmitted" DATETIME,
    "grossValueCertified" DECIMAL,
    "certifiedDate" DATETIME,
    "paymentDueDate" DATETIME,
    "advancePaymentRecovery" DECIMAL,
    "retention" DECIMAL,
    "contraCharges" DECIMAL,
    "netCertifiedPayable" DECIMAL,
    "vat5Percent" DECIMAL,
    "netPayable" DECIMAL,
    "receivedPayment" DECIMAL,
    "paymentReceivedDate" DATETIME,
    "inProcess" DECIMAL,
    "dueDays" INTEGER,
    "overDueAmount" DECIMAL,
    "remarks" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_ipc_projectId_fkey"
        FOREIGN KEY ("projectId")
        REFERENCES "projects" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "project_ipc_projectId_invoiceNumber_key"
    ON "project_ipc"("projectId", "invoiceNumber");

CREATE INDEX "project_ipc_projectId_idx"
    ON "project_ipc"("projectId");

CREATE INDEX "project_ipc_sortOrder_idx"
    ON "project_ipc"("sortOrder");

