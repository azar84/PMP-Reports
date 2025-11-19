import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const projectSupplierSchema = z.object({
  projectId: z.number(),
  supplierId: z.number(),
  notes: z.string().optional().nullable(),
});

// GET - Fetch project suppliers for a specific project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const projectSuppliers = await prisma.projectSupplier.findMany({
      where: {
        projectId: parseInt(projectId),
      },
      include: {
        supplier: {
          include: {
            typeOfWorks: {
              include: {
                typeOfWork: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: projectSuppliers });
  } catch (error) {
    console.error('Error fetching project suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project suppliers' },
      { status: 500 }
    );
  }
}

// POST - Create new project supplier relationship
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = projectSupplierSchema.parse(body);

    // Check if the relationship already exists
    const existing = await prisma.projectSupplier.findUnique({
      where: {
        projectId_supplierId: {
          projectId: validatedData.projectId,
          supplierId: validatedData.supplierId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Supplier is already assigned to this project' },
        { status: 409 }
      );
    }

    const projectSupplier = await prisma.projectSupplier.create({
      data: {
        projectId: validatedData.projectId,
        supplierId: validatedData.supplierId,
        notes: validatedData.notes || null,
      },
      include: {
        supplier: {
          include: {
            typeOfWorks: {
              include: {
                typeOfWork: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: projectSupplier });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating project supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project supplier' },
      { status: 500 }
    );
  }
}

