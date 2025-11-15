-- Add VAT and Prolongation Cost Expected Value fields to project_commercial table
ALTER TABLE "project_commercial" ADD COLUMN "vat" DECIMAL;
ALTER TABLE "project_commercial" ADD COLUMN "prolongationCostExpectedValue" DECIMAL;

