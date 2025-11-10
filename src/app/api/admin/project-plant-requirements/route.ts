import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS } from '@/lib/permissionsCatalog';
import { z } from 'zod';

const optionalDateString = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    return value;
  },
  z.string().optional()
);

const optionalNumber = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    if (typeof value === 'number') return value;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  },
  z.number().optional()
);

const requirementSchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable().or(z.literal('')),
  requiredQuantity: z.number().int().min(1, 'Required quantity must be at least 1'),
  notes: z.string().optional().nullable().or(z.literal('')),
  plannedStartDate: optionalDateString.optional(),
  plannedEndDate: optionalDateString.optional(),
  monthlyBudget: optionalNumber.nullable().optional(),
  useSlotDates: z.boolean().optional(),
  slots: z
    .array(
      z.object({
        slotIndex: z.number().int().min(0),
        plannedStartDate: optionalDateString.optional(),
        plannedEndDate: optionalDateString.optional(),
      })
    )
    .optional()
    .refine(
      (slots) => {
        if (!slots) return true;
        const sorted = [...slots].sort((a, b) => a.slotIndex - b.slotIndex);
        return sorted.every((slot, index) => slot.slotIndex === index);
      },
      {
        message: 'Slot indices must be contiguous starting from 0',
      }
    ),
});

function serializeRequirement(requirement: any) {
  return {
    ...requirement,
    monthlyBudget: requirement.monthlyBudget !== null && requirement.monthlyBudget !== undefined
      ? Number(requirement.monthlyBudget)
      : null,
    plannedStartDate: requirement.plannedStartDate ? requirement.plannedStartDate.toISOString() : null,
    plannedEndDate: requirement.plannedEndDate ? requirement.plannedEndDate.toISOString() : null,
    useSlotDates: requirement.useSlotDates ?? false,
    slots: requirement.slots?.map((slot: any) => ({
      ...slot,
      plannedStartDate: slot.plannedStartDate ? slot.plannedStartDate.toISOString() : null,
      plannedEndDate: slot.plannedEndDate ? slot.plannedEndDate.toISOString() : null,
    })) ?? [],
    assignments: requirement.assignments?.map((assignment: any) => ({
      ...assignment,
      slotIndex: assignment.slotIndex !== null && assignment.slotIndex !== undefined ? Number(assignment.slotIndex) : null,
      monthlyCost: assignment.monthlyCost ? Number(assignment.monthlyCost) : null,
      plant: assignment.plant
        ? {
            ...assignment.plant,
            monthlyCost: assignment.plant.monthlyCost ? Number(assignment.plant.monthlyCost) : 0,
          }
        : null,
    })) ?? [],
  };
}

export const GET = withRBAC(PERMISSIONS.PROJECTS_VIEW, async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const projectIdParam = searchParams.get('projectId');

  if (!projectIdParam) {
    return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
  }

  const projectId = Number(projectIdParam);
  if (Number.isNaN(projectId)) {
    return NextResponse.json({ success: false, error: 'Project ID must be a number' }, { status: 400 });
  }

  const requirements = await prisma.projectPlantRequirement.findMany({
    where: { projectId },
    include: {
      slots: {
        orderBy: { slotIndex: 'asc' },
      },
      assignments: {
        include: { plant: true },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    success: true,
    data: requirements.map(serializeRequirement),
  });
});

export const POST = withRBAC(PERMISSIONS.PROJECTS_UPDATE, async (request: NextRequest) => {
  const body = await request.json();
  const validated = requirementSchema.parse(body);

  const requirement = await prisma.projectPlantRequirement.create({
    data: {
      projectId: validated.projectId,
      title: validated.title.trim(),
      description: validated.description?.trim() || null,
      requiredQuantity: validated.requiredQuantity,
      notes: validated.notes?.trim() || null,
      plannedStartDate: validated.plannedStartDate ? new Date(validated.plannedStartDate) : null,
      plannedEndDate: validated.plannedEndDate ? new Date(validated.plannedEndDate) : null,
      monthlyBudget: validated.monthlyBudget ?? null,
      useSlotDates: validated.useSlotDates ?? false,
      slots: validated.slots
        ? {
            create: validated.slots.map((slot) => ({
              slotIndex: slot.slotIndex,
              plannedStartDate: slot.plannedStartDate ? new Date(slot.plannedStartDate) : null,
              plannedEndDate: slot.plannedEndDate ? new Date(slot.plannedEndDate) : null,
            })),
          }
        : undefined,
    },
    include: {
      slots: {
        orderBy: { slotIndex: 'asc' },
      },
      assignments: {
        include: { plant: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: serializeRequirement(requirement),
    },
    { status: 201 }
  );
});
