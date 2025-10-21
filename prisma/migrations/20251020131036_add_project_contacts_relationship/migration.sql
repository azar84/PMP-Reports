-- CreateTable
CREATE TABLE "project_contacts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_contacts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_contacts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "project_contacts_projectId_contactId_key" ON "project_contacts"("projectId", "contactId");

-- Migrate existing primary contacts to project_contacts table
-- For now, we'll create project-contact relationships for all contacts
-- The isPrimary flag will be preserved from the contacts table
INSERT INTO "project_contacts" ("projectId", "contactId", "isPrimary", "createdAt", "updatedAt")
SELECT 
    p.id as "projectId",
    c.id as "contactId", 
    c."isPrimary" as "isPrimary",
    CURRENT_TIMESTAMP as "createdAt",
    CURRENT_TIMESTAMP as "updatedAt"
FROM "projects" p
CROSS JOIN "contacts" c
WHERE c."entityType" = 'client' AND c."entityId" = p."clientId"
   OR c."entityType" = 'consultant' AND (
       c."entityId" = p."projectManagementConsultantId" OR
       c."entityId" = p."designConsultantId" OR
       c."entityId" = p."costConsultantId" OR
       c."entityId" = p."supervisionConsultantId"
   );

-- DropColumn
ALTER TABLE "contacts" DROP COLUMN "isPrimary";
