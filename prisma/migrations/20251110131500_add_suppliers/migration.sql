-- Create Type of Work lookup table
CREATE TABLE "type_of_works" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "type_of_works_name_key"
    ON "type_of_works"("name");

-- Create Suppliers table
CREATE TABLE "suppliers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenantId" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contactPerson" TEXT,
    "contactNumber" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "suppliers_tenantId_fkey"
        FOREIGN KEY ("tenantId")
        REFERENCES "tenants" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "suppliers_tenantId_name_key"
    ON "suppliers"("tenantId", "name");

CREATE INDEX "suppliers_tenantId_idx"
    ON "suppliers"("tenantId");

-- Create supplier to type_of_work join table
CREATE TABLE "supplier_type_of_work" (
    "supplierId" INTEGER NOT NULL,
    "typeOfWorkId" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "supplier_type_of_work_supplierId_fkey"
        FOREIGN KEY ("supplierId")
        REFERENCES "suppliers" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT "supplier_type_of_work_typeOfWorkId_fkey"
        FOREIGN KEY ("typeOfWorkId")
        REFERENCES "type_of_works" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    PRIMARY KEY ("supplierId", "typeOfWorkId")
);
