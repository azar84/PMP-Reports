ALTER TABLE "project_control_milestones" ADD COLUMN "actualStartDate" DATETIME;
ALTER TABLE "project_control_milestones" ADD COLUMN "actualEndDate" DATETIME;
ALTER TABLE "project_control_milestones" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'Pending';
