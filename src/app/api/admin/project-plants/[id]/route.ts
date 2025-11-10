import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS } from '@/lib/permissionsCatalog';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { parseDateFromInput } from '@/lib/dateUtils';

const updateSchema = z.object({
  plantId: z.number().int().positive().optional(),
  requirementId: z.number().int().positive().optional().nullable(),
  startDate: z.string().optional().nullable().or(z.literal('')),
  endDate: z.string().optional().nullable().or(z.literal('')),
  status: z.string().optional().default('Active'),
  notes: z.string().optional().nullable().or(z.literal('')),
  monthlyCost: z.number().min(0).optional().nullable(),
  slotIndex: z.number().int().min(0).optional().nullable(),
});

function serializeAssignment(assignment: any) {
  return {
    ...assignment,
    slotIndex: assignment.slotIndex !== null && assignment.slotIndex !== undefined ? Number(assignment.slotIndex) : null,
    monthlyCost: assignment.monthlyCost ? Number(assignment.monthlyCost) : null,
    plant: assignment.plant
      ? {
          ...assignment.plant,
          monthlyCost: assignment.plant.monthlyCost ? Number(assignment.plant.monthlyCost) : 0,
        }
      : null,
    requirement: assignment.requirement
      ? {
          ...assignment.requirement,
          useSlotDates: assignment.requirement.useSlotDates ?? false,
          assignments: assignment.requirement.assignments?.map((item: any) => ({
            ...item,
            slotIndex: item.slotIndex !== null && item.slotIndex !== undefined ? Number(item.slotIndex) : null,
            monthlyCost: item.monthlyCost ? Number(item.monthlyCost) : null,
            plant: item.plant
              ? {
                  ...item.plant,
                  monthlyCost: item.plant.monthlyCost ? Number(item.plant.monthlyCost) : 0,
                }
              : null,
          })) ?? [],
          slots: assignment.requirement.slots?.map((slot: any) => ({
            ...slot,
            plannedStartDate: slot.plannedStartDate ? slot.plannedStartDate.toISOString() : null,
            plannedEndDate: slot.plannedEndDate ? slot.plannedEndDate.toISOString() : null,
          })) ?? [],
        }
      : null,
  };
}

export const PUT = withRBAC(PERMISSIONS.PROJECTS_UPDATE, async (request, _context, { params }) => {
  const { id } = await params;
  const assignmentId = Number(id);
  if (Number.isNaN(assignmentId)) {
    return NextResponse.json({ success: false, error: 'Invalid assignment ID' }, { status: 400 });
  }

  const body = await request.json();
  const validated = updateSchema.parse(body);

  const existingAssignment = await prisma.projectPlant.findUnique({
    where: { id: assignmentId },
    include: {
      requirement: {
        include: {
          slots: { orderBy: { slotIndex: 'asc' } },
          assignments: true,
        },
      },
    },
  });

  if (!existingAssignment) {
    return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
  }

  const targetRequirementId =
    validated.requirementId !== undefined ? validated.requirementId : existingAssignment.requirementId;

  let targetRequirement = null;
  if (targetRequirementId) {
    targetRequirement = await prisma.projectPlantRequirement.findUnique({
      where: { id: targetRequirementId },
      include: {
        slots: { orderBy: { slotIndex: 'asc' } },
        assignments: true,
      },
    });

    if (!targetRequirement) {
      return NextResponse.json({ success: false, error: 'Requirement not found' }, { status: 404 });
    }
  }

  let slotIndex: number | null =
    validated.slotIndex !== undefined ? (validated.slotIndex !== null ? validated.slotIndex : null) : existingAssignment.slotIndex;

  let startDate: Date | null =
    validated.startDate !== undefined ? parseDateFromInput(validated.startDate) || null : existingAssignment.startDate;
  let endDate: Date | null =
    validated.endDate !== undefined ? parseDateFromInput(validated.endDate) || null : existingAssignment.endDate;

  if (targetRequirement?.useSlotDates) {
    const totalSlots =
      targetRequirement.slots.length > 0 ? targetRequirement.slots.length : targetRequirement.requiredQuantity;
    const usedSlots = new Set<number>();
    targetRequirement.assignments.forEach((assignment) => {
      if (assignment.id === assignmentId) return;
      if (assignment.slotIndex !== null && assignment.slotIndex !== undefined) {
        usedSlots.add(Number(assignment.slotIndex));
      }
    });

    if (slotIndex === null || slotIndex === undefined) {
      for (let i = 0; i < totalSlots; i += 1) {
        if (!usedSlots.has(i)) {
          slotIndex = i;
          break;
        }
      }
    }

    if (slotIndex === null || slotIndex < 0 || slotIndex >= totalSlots) {
      return NextResponse.json(
        { success: false, error: 'No available plant slots for this requirement' },
        { status: 400 }
      );
    }

    if (usedSlots.has(slotIndex)) {
      return NextResponse.json(
        { success: false, error: 'Selected plant slot is already assigned' },
        { status: 400 }
      );
    }

    const slotMeta = targetRequirement.slots.find((slot) => slot.slotIndex === slotIndex);
    if (validated.startDate === undefined) {
      if (slotMeta?.plannedStartDate) {
        startDate = slotMeta.plannedStartDate;
      } else if (targetRequirement.plannedStartDate) {
        startDate = targetRequirement.plannedStartDate;
      }
    }
    if (validated.endDate === undefined) {
      if (slotMeta?.plannedEndDate) {
        endDate = slotMeta.plannedEndDate;
      } else if (targetRequirement.plannedEndDate) {
        endDate = targetRequirement.plannedEndDate;
      }
    }
  } else if (targetRequirementId) {
    // Requirement does not use slot dates, clear slot index
    slotIndex = null;
  } else {
    slotIndex = null;
  }

  const assignment = await prisma.projectPlant.update({
    where: { id: assignmentId },
    data: {
      plantId: validated.plantId ?? undefined,
      requirementId: validated.requirementId !== undefined ? validated.requirementId ?? null : undefined,
      slotIndex,
      startDate,
      endDate,
      status: validated.status || 'Active',
      notes: validated.notes?.trim() || null,
      monthlyCost:
        validated.monthlyCost !== undefined && validated.monthlyCost !== null
          ? new Prisma.Decimal(validated.monthlyCost)
          : null,
    },
    include: {
      plant: true,
      requirement: {
        include: {
          slots: {
            orderBy: { slotIndex: 'asc' },
          },
          assignments: {
            include: { plant: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: serializeAssignment(assignment) });
});

export const DELETE = withRBAC(PERMISSIONS.PROJECTS_DELETE, async (_request, _context, { params }) => {
  const { id } = await params;
  const assignmentId = Number(id);
  if (Number.isNaN(assignmentId)) {
    return NextResponse.json({ success: false, error: 'Invalid assignment ID' }, { status: 400 });
  }

  await prisma.projectPlant.delete({ where: { id: assignmentId } });
  return NextResponse.json({ success: true });
});
