-- Add flag for slot-specific scheduling
ALTER TABLE "project_plant_requirements"
  ADD COLUMN "useSlotDates" BOOLEAN DEFAULT false;

-- Extend requirement slots with planned dates
ALTER TABLE "project_plant_requirement_slots"
  ADD COLUMN "plannedStartDate" DATETIME,
  ADD COLUMN "plannedEndDate" DATETIME;

ALTER TABLE "project_plants"
  ADD COLUMN "slotIndex" INTEGER;

