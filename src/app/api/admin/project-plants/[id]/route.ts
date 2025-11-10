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

export const PUT = withRBAC(PERMISSIONS.PROJECTS_UPDATE, async (request, _context, { params }) => {
  const { id } = await params;
  const assignmentId = Number(id);
  if (Number.isNaN(assignmentId)) {
    return NextResponse.json({ success: false, error: 'Invalid assignment ID' }, { status: 400 });
  }

  const body = await request.json();
  const validated = updateSchema.parse(body);

  const assignment = await prisma.projectPlant.update({
    where: { id: assignmentId },
    data: {
      plantId: validated.plantId ?? undefined,
      requirementId: validated.requirementId ?? null,
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
