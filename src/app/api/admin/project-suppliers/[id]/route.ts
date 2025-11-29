import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const updateProjectSupplierSchema = z.object({
  notes: z.string().optional().nullable(),
  performanceRating: z.number().int().min(1).max(5).optional().nullable(),
  performanceReview: z.string().optional().nullable(),
});

// PUT - Update project supplier relationship
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSupplierId = parseInt(id);

    if (isNaN(projectSupplierId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project supplier ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateProjectSupplierSchema.parse(body);

    // Check if the project supplier exists
    const existing = await prisma.projectSupplier.findUnique({
      where: { id: projectSupplierId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Project supplier not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }
    if (validatedData.performanceRating !== undefined) {
      updateData.performanceRating = validatedData.performanceRating;
    }
    if (validatedData.performanceReview !== undefined) {
      updateData.performanceReview = validatedData.performanceReview;
    }

    const updated = await prisma.projectSupplier.update({
      where: { id: projectSupplierId },
      data: updateData,
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

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating project supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project supplier' },
      { status: 500 }
    );
  }
}

// DELETE - Remove supplier from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSupplierId = parseInt(id);

    if (isNaN(projectSupplierId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project supplier ID' },
        { status: 400 }
      );
    }

    const projectSupplier = await prisma.projectSupplier.findUnique({
      where: { id: projectSupplierId },
    });

    if (!projectSupplier) {
      return NextResponse.json(
        { success: false, error: 'Project supplier not found' },
        { status: 404 }
      );
    }

    await prisma.projectSupplier.delete({
      where: { id: projectSupplierId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project supplier' },
      { status: 500 }
    );
  }
}
