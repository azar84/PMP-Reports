import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS } from '@/lib/permissionsCatalog';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { parseDateFromInput } from '@/lib/dateUtils';

const plantDataSchema = z.object({
  plantDescription: z.string().min(1, 'Plant description is required'),
  plantCode: z.string().min(1, 'Plant code is required'),
  plateNumber: z.string().optional().nullable().or(z.literal('')),
  plantType: z.enum(['direct', 'indirect']).default('direct'),
  isOwned: z.boolean().optional().default(false),
  monthlyCost: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const assignmentSchema = z.object({
  projectId: z.number().int().positive(),
  requirementId: z.number().int().positive().optional().nullable(),
  plantId: z.number().int().positive().optional(),
  plantData: plantDataSchema.optional(),
  startDate: z.string().optional().nullable().or(z.literal('')),
  endDate: z.string().optional().nullable().or(z.literal('')),
  status: z.string().optional().default('Active'),
  notes: z.string().optional().nullable().or(z.literal('')),
  monthlyCost: z.number().min(0).optional().nullable(),
  slotIndex: z.number().int().min(0).optional(),
});

function serializeAssignment(assignment: any) {
  return {
    id: assignment.id,
    projectId: assignment.projectId,
    plantId: assignment.plantId,
    requirementId: assignment.requirementId,
    slotIndex: assignment.slotIndex !== null && assignment.slotIndex !== undefined ? Number(assignment.slotIndex) : null,
    startDate: assignment.startDate ? assignment.startDate.toISOString() : null,
    endDate: assignment.endDate ? assignment.endDate.toISOString() : null,
    status: assignment.status,
    notes: assignment.notes,
    monthlyCost: assignment.monthlyCost ? Number(assignment.monthlyCost) : null,
    createdAt: assignment.createdAt ? assignment.createdAt.toISOString() : null,
    updatedAt: assignment.updatedAt ? assignment.updatedAt.toISOString() : null,
    plant: assignment.plant
      ? {
          id: assignment.plant.id,
          tenantId: assignment.plant.tenantId,
          plantDescription: assignment.plant.plantDescription,
          plantCode: assignment.plant.plantCode,
          plateNumber: assignment.plant.plateNumber,
          plantType: assignment.plant.plantType, // Explicitly include plantType for categorization
          isOwned: assignment.plant.isOwned,
          monthlyCost: assignment.plant.monthlyCost ? Number(assignment.plant.monthlyCost) : 0,
          isActive: assignment.plant.isActive,
          createdAt: assignment.plant.createdAt ? assignment.plant.createdAt.toISOString() : null,
          updatedAt: assignment.plant.updatedAt ? assignment.plant.updatedAt.toISOString() : null,
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
                  id: item.plant.id,
                  tenantId: item.plant.tenantId,
                  plantDescription: item.plant.plantDescription,
                  plantCode: item.plant.plantCode,
                  plateNumber: item.plant.plateNumber,
                  plantType: item.plant.plantType, // Explicitly include plantType for categorization
                  isOwned: item.plant.isOwned,
                  monthlyCost: item.plant.monthlyCost ? Number(item.plant.monthlyCost) : 0,
                  isActive: item.plant.isActive,
                  createdAt: item.plant.createdAt,
                  updatedAt: item.plant.updatedAt,
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

  const assignments = await prisma.projectPlant.findMany({
    where: { projectId },
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
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: assignments.map(serializeAssignment) });
});

export const POST = withRBAC(PERMISSIONS.PROJECTS_UPDATE, async (request, context) => {
  const body = await request.json();
  const validated = assignmentSchema.parse(body);

  if (!validated.plantId && !validated.plantData) {
    return NextResponse.json(
      { success: false, error: 'Either plantId or plantData must be provided' },
      { status: 400 }
    );
  }

  let plantId = validated.plantId ?? null;
  if (!plantId && validated.plantData) {
    const plant = await prisma.plant.create({
      data: {
        tenantId: context.tenantId,
        plantDescription: validated.plantData.plantDescription.trim(),
        plantCode: validated.plantData.plantCode.trim(),
        plateNumber: validated.plantData.plateNumber?.trim() || null,
        plantType: validated.plantData.plantType,
        isOwned: validated.plantData.isOwned ?? false,
        monthlyCost:
          validated.plantData.monthlyCost !== undefined && validated.plantData.monthlyCost !== null
            ? validated.plantData.monthlyCost
            : 0,
        isActive: validated.plantData.isActive ?? true,
      },
    });
    plantId = plant.id;
  }

  const requirementData = validated.requirementId
    ? await prisma.projectPlantRequirement.findUnique({
        where: { id: validated.requirementId },
        include: {
          slots: { orderBy: { slotIndex: 'asc' } },
          assignments: true,
        },
      })
    : null;

  if (validated.requirementId && !requirementData) {
    return NextResponse.json(
      { success: false, error: 'Requirement not found' },
      { status: 404 }
    );
  }

  let slotIndex: number | null =
    validated.slotIndex !== undefined && validated.slotIndex !== null ? validated.slotIndex : null;

  let startDate: Date | null = parseDateFromInput(validated.startDate) || null;
  let endDate: Date | null = parseDateFromInput(validated.endDate) || null;

  if (requirementData?.useSlotDates) {
    const totalSlots =
      requirementData.slots.length > 0 ? requirementData.slots.length : requirementData.requiredQuantity;
    const usedSlots = new Set<number>();
    requirementData.assignments.forEach((assignment) => {
      if (
        assignment.slotIndex !== null &&
        assignment.slotIndex !== undefined
      ) {
        usedSlots.add(Number(assignment.slotIndex));
      }
    });

    if (slotIndex === null) {
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

    const slotMeta = requirementData.slots.find((slot) => slot.slotIndex === slotIndex);
    if (!startDate) {
      if (slotMeta?.plannedStartDate) {
        startDate = slotMeta.plannedStartDate;
      } else if (requirementData.plannedStartDate) {
        startDate = requirementData.plannedStartDate;
      }
    }
    if (!endDate) {
      if (slotMeta?.plannedEndDate) {
        endDate = slotMeta.plannedEndDate;
      } else if (requirementData.plannedEndDate) {
        endDate = requirementData.plannedEndDate;
      }
    }
  }

  const assignment = await prisma.projectPlant.create({
    data: {
      projectId: validated.projectId,
      requirementId: validated.requirementId ?? null,
      plantId,
      slotIndex,
      startDate,
      endDate,
      status: validated.status || 'Active',
      notes: validated.notes?.trim() || null,
      monthlyCost:
        validated.monthlyCost !== undefined && validated.monthlyCost !== null
          ? validated.monthlyCost
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

  return NextResponse.json(
    {
      success: true,
      data: serializeAssignment(assignment),
    },
    { status: 201 }
  );
});
