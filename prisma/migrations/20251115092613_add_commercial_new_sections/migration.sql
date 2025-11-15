-- AlterTable
ALTER TABLE "project_commercial" ADD COLUMN "budgetUpToDate" DECIMAL;
ALTER TABLE "project_commercial" ADD COLUMN "totalActualCostToDate" DECIMAL;
ALTER TABLE "project_commercial" ADD COLUMN "forecastedBudgetAtCompletion" DECIMAL;
ALTER TABLE "project_commercial" ADD COLUMN "forecastedCostAtCompletion" DECIMAL;
ALTER TABLE "project_commercial" ADD COLUMN "overallStatus" TEXT;
ALTER TABLE "project_commercial" ADD COLUMN "projectProgressPercentage" DECIMAL;
ALTER TABLE "project_commercial" ADD COLUMN "projectRevenuePercentage" DECIMAL;
ALTER TABLE "project_commercial" ADD COLUMN "projectCostPercentage" DECIMAL;

