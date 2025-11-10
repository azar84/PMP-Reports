-- Add planned dates and monthly budget to plant requirements
ALTER TABLE "project_plant_requirements" ADD COLUMN "plannedStartDate" DATETIME;
ALTER TABLE "project_plant_requirements" ADD COLUMN "plannedEndDate" DATETIME;
ALTER TABLE "project_plant_requirements" ADD COLUMN "monthlyBudget" REAL;

