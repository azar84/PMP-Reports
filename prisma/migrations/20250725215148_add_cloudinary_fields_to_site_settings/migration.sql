-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "cloudinaryApiKey" TEXT,
ADD COLUMN     "cloudinaryApiSecret" TEXT,
ADD COLUMN     "cloudinaryCloudName" TEXT,
ADD COLUMN     "cloudinaryEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cloudinaryUploadPreset" TEXT;
