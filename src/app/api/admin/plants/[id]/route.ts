import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS } from '@/lib/permissionsCatalog';
import { Prisma } from '@prisma/client';

const updatePlantSchema = z.object({
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

export const PUT = withRBAC(PERMISSIONS.PROJECTS_UPDATE, async (request, context, { params }) => {
  const { id } = await params;
  const plantId = Number(id);
  if (Number.isNaN(plantId)) {
    return NextResponse.json({ success: false, error: 'Invalid plant ID' }, { status: 400 });
  }

  const plant = await prisma.plant.findFirst({ where: { id: plantId, tenantId: context.tenantId } });
  if (!plant) {
    return NextResponse.json({ success: false, error: 'Plant not found' }, { status: 404 });
  }

  const body = await request.json();
  const validated = updatePlantSchema.parse(body);

  const updated = await prisma.plant.update({
    where: { id: plantId },
    data: {
      plantDescription: validated.plantDescription.trim(),
      plantCode: validated.plantCode.trim(),
      plateNumber: validated.plateNumber?.trim() || null,
      plantType: validated.plantType,
      isOwned: validated.isOwned ?? false,
      monthlyCost:
        validated.monthlyCost !== undefined && validated.monthlyCost !== null
          ? new Prisma.Decimal(validated.monthlyCost)
          : new Prisma.Decimal(0),
      isActive: validated.isActive ?? true,
    },
  });

  return NextResponse.json({
    success: true,
    data: serializePlant(updated),
  });
});

export const DELETE = withRBAC(PERMISSIONS.PROJECTS_DELETE, async (_request, context, { params }) => {
  const { id } = await params;
  const plantId = Number(id);
  if (Number.isNaN(plantId)) {
    return NextResponse.json({ success: false, error: 'Invalid plant ID' }, { status: 400 });
  }

  const plant = await prisma.plant.findFirst({ where: { id: plantId, tenantId: context.tenantId } });
  if (!plant) {
    return NextResponse.json({ success: false, error: 'Plant not found' }, { status: 404 });
  }

  await prisma.projectPlant.updateMany({
    where: { plantId },
    data: { plantId: null },
  });

  await prisma.plant.delete({ where: { id: plantId } });

  return NextResponse.json({ success: true });
});
