-- Add sidebar color columns to site_settings table
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS "sidebarBackgroundColor" TEXT DEFAULT '#1F2937',
ADD COLUMN IF NOT EXISTS "sidebarTextColor" TEXT DEFAULT '#E5E7EB',
ADD COLUMN IF NOT EXISTS "sidebarSelectedColor" TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS "sidebarHoverColor" TEXT DEFAULT '#D1D5DB'; 