-- Add enhanced events field to CTA table
ALTER TABLE "ctas" ADD COLUMN "events" JSONB;

-- Create GlobalFunctions table
CREATE TABLE "global_functions" (
    "id" SERIAL PRIMARY KEY,
    "functions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
); 