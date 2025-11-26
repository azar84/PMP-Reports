import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const updateProjectSubcontractorSchema = z.object({
  scopeOfWork: z.string().optional().nullable(),
  subcontractAgreement: z.boolean().optional(),
  subcontractAgreementDocumentUrl: z.string().optional().nullable(),
});

// PUT - Update project subcontractor relationship
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSubcontractorId = parseInt(id);

    if (isNaN(projectSubcontractorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project subcontractor ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateProjectSubcontractorSchema.parse(body);

    // Check if the project subcontractor exists
    const existing = await prisma.projectSubcontractor.findUnique({
      where: { id: projectSubcontractorId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Project subcontractor not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (validatedData.scopeOfWork !== undefined) {
      updateData.scopeOfWork = validatedData.scopeOfWork;
    }
    if (validatedData.subcontractAgreement !== undefined) {
      updateData.subcontractAgreement = validatedData.subcontractAgreement;
    }
    if (validatedData.subcontractAgreementDocumentUrl !== undefined) {
      updateData.subcontractAgreementDocumentUrl = validatedData.subcontractAgreementDocumentUrl;
    }

    const updated = await prisma.projectSubcontractor.update({
      where: { id: projectSubcontractorId },
      data: updateData,
      include: {
        subcontractor: {
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

    console.error('Error updating project subcontractor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project subcontractor' },
      { status: 500 }
    );
  }
}

// DELETE - Remove subcontractor from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSubcontractorId = parseInt(id);

    if (isNaN(projectSubcontractorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project subcontractor ID' },
        { status: 400 }
      );
    }

    const projectSubcontractor = await prisma.projectSubcontractor.findUnique({
      where: { id: projectSubcontractorId },
    });

    if (!projectSubcontractor) {
      return NextResponse.json(
        { success: false, error: 'Project subcontractor not found' },
        { status: 404 }
      );
    }

    await prisma.projectSubcontractor.delete({
      where: { id: projectSubcontractorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project subcontractor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project subcontractor' },
      { status: 500 }
    );
  }
}

