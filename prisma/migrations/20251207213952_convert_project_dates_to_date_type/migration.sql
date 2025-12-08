-- Convert startDate and endDate from TIMESTAMP to DATE type
-- This preserves all existing data by casting the timestamp to date
-- PostgreSQL will automatically extract the date part from timestamps

ALTER TABLE "projects" 
  ALTER COLUMN "startDate" TYPE DATE USING ("startDate"::DATE),
  ALTER COLUMN "endDate" TYPE DATE USING ("endDate"::DATE);
