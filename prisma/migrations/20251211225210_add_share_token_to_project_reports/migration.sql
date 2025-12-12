-- AlterTable: Add shareToken column to project_reports
-- This is a safe migration as the column is nullable and won't affect existing data
ALTER TABLE "project_reports" ADD COLUMN IF NOT EXISTS "shareToken" TEXT;

-- CreateIndex: Create unique constraint on shareToken
CREATE UNIQUE INDEX IF NOT EXISTS "project_reports_shareToken_key" ON "project_reports"("shareToken");

-- CreateIndex: Create index on shareToken for faster lookups
CREATE INDEX IF NOT EXISTS "project_reports_shareToken_idx" ON "project_reports"("shareToken");
