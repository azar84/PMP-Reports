import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS } from '@/lib/permissionsCatalog';
import { z } from 'zod';

const requirementSchema = z.object({
  projectId: z.number().int().positive(),
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
    },
    include: {
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
