import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS } from '@/lib/permissionsCatalog';
import { Prisma } from '@prisma/client';

const createPlantSchema = z.object({
  plantDescription: z.string().min(1, 'Plant description is required'),
  plantCode: z.string().min(1, 'Plant code is required'),
  plateNumber: z.string().optional().nullable().or(z.literal('')),
  plantType: z.enum(['direct', 'indirect']).default('direct'),
  isOwned: z.boolean().optional().default(false),
  monthlyCost: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

function serializePlant(plant: any) {
  return {
    ...plant,
    monthlyCost: plant.monthlyCost ? Number(plant.monthlyCost) : 0,
  };
}

export const GET = withRBAC(PERMISSIONS.PROJECTS_VIEW, async (_request, context) => {
  const plants = await prisma.plant.findMany({
    where: { tenantId: context.tenantId },
    orderBy: [{ isActive: 'desc' }, { plantDescription: 'asc' }],
  });

  return NextResponse.json({
    success: true,
    data: plants.map(serializePlant),
  });
});

export const POST = withRBAC(PERMISSIONS.PROJECTS_CREATE, async (request, context) => {
  const body = await request.json();
  const validated = createPlantSchema.parse(body);

  const plant = await prisma.plant.create({
    data: {
      tenantId: context.tenantId,
      plantDescription: validated.plantDescription.trim(),
      plantCode: validated.plantCode.trim(),
      plateNumber: validated.plateNumber?.trim() || null,
      plantType: validated.plantType,
      isOwned: validated.isOwned ?? false,
       monthlyCost:
         validated.monthlyCost !== undefined && validated.monthlyCost !== null
           ? validated.monthlyCost
           : 0,
      isActive: validated.isActive ?? true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: serializePlant(plant),
    },
    { status: 201 }
  );
});
