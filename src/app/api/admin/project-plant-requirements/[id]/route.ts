import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS } from '@/lib/permissionsCatalog';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable().or(z.literal('')),
  requiredQuantity: z.number().int().min(1, 'Required quantity must be at least 1'),
  notes: z.string().optional().nullable().or(z.literal('')),
});

function serializeRequirement(requirement: any) {
  return {
    ...requirement,
    assignments: requirement.assignments?.map((assignment: any) => ({
      ...assignment,
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

export const PUT = withRBAC(PERMISSIONS.PROJECTS_UPDATE, async (request, _context, { params }) => {
  const { id } = await params;
  const requirementId = Number(id);
  if (Number.isNaN(requirementId)) {
    return NextResponse.json({ success: false, error: 'Invalid requirement ID' }, { status: 400 });
  }

  const body = await request.json();
  const validated = updateSchema.parse(body);

  const requirement = await prisma.projectPlantRequirement.update({
    where: { id: requirementId },
    data: {
      title: validated.title.trim(),
      description: validated.description?.trim() || null,
      requiredQuantity: validated.requiredQuantity,
      notes: validated.notes?.trim() || null,
    },
    include: {
      assignments: {
        include: { plant: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return NextResponse.json({ success: true, data: serializeRequirement(requirement) });
});

export const DELETE = withRBAC(PERMISSIONS.PROJECTS_DELETE, async (_request, _context, { params }) => {
  const { id } = await params;
  const requirementId = Number(id);
  if (Number.isNaN(requirementId)) {
    return NextResponse.json({ success: false, error: 'Invalid requirement ID' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.projectPlant.updateMany({
      where: { requirementId },
      data: { requirementId: null },
    }),
    prisma.projectPlantRequirement.delete({ where: { id: requirementId } }),
  ]);

  return NextResponse.json({ success: true });
});
