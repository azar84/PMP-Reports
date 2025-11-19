import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

