-- AlterTable
ALTER TABLE "project_contacts" ADD COLUMN "consultantType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "project_contacts_projectId_contactId_consultantType_key" ON "project_contacts"("projectId", "contactId", "consultantType");
