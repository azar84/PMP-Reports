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
});

function serializeAssignment(assignment: any) {
  return {
    ...assignment,
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
          assignments: assignment.requirement.assignments?.map((item: any) => ({
            ...item,
            monthlyCost: item.monthlyCost ? Number(item.monthlyCost) : null,
            plant: item.plant
              ? {
                  ...item.plant,
                  monthlyCost: item.plant.monthlyCost ? Number(item.plant.monthlyCost) : 0,
                }
              : null,
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
            ? new Prisma.Decimal(validated.plantData.monthlyCost)
            : new Prisma.Decimal(0),
        isActive: validated.plantData.isActive ?? true,
      },
    });
    plantId = plant.id;
  }

  const assignment = await prisma.projectPlant.create({
    data: {
      projectId: validated.projectId,
      requirementId: validated.requirementId ?? null,
      plantId,
      startDate: parseDateFromInput(validated.startDate) || null,
      endDate: parseDateFromInput(validated.endDate) || null,
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
