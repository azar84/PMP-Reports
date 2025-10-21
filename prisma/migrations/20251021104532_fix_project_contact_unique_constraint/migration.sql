-- Drop the existing unique constraint
DROP INDEX "project_contacts_projectId_contactId_key";

-- Add new unique constraint that includes consultantType
CREATE UNIQUE INDEX "project_contacts_projectId_contactId_consultantType_key" ON "project_contacts"("projectId", "contactId", "consultantType");
