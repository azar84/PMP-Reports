import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { parseDateFromInput } from '@/lib/dateUtils';

const updateProjectLabourSchema = z.object({
  labourId: z.number().int().positive().nullable().optional(),
  utilization: z.number().int().min(0).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
});

// GET - Fetch specific project labour assignment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const labourId = parseInt(id);

    if (isNaN(labourId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid labour assignment ID' },
        { status: 400 }
      );
    }

    const projectLabour = await prisma.projectLabour.findUnique({
      where: { id: labourId },
      include: {
        labour: true,
        trade: true,
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
      },
    });

    if (!projectLabour) {
      return NextResponse.json(
        { success: false, error: 'Project labour assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: projectLabour });
  } catch (error) {
    console.error('Error fetching project labour assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project labour assignment' },
      { status: 500 }
    );
  }
}

// PUT - Update project labour assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const labourId = parseInt(id);

    if (isNaN(labourId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid labour assignment ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateProjectLabourSchema.parse(body);

    const updateData: any = {};
    if (validatedData.utilization !== undefined) updateData.utilization = validatedData.utilization;
    if (validatedData.startDate !== undefined) {
      updateData.startDate = parseDateFromInput(validatedData.startDate);
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = parseDateFromInput(validatedData.endDate);
    }
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes || null;
    if (validatedData.labourId !== undefined) updateData.labourId = validatedData.labourId;

    const assignment = await prisma.projectLabour.update({
      where: { id: labourId },
      data: updateData,
      include: {
        labour: true,
        trade: true,
      },
    });

    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    console.error('Error updating project labour assignment:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update project labour assignment' },
      { status: 500 }
    );
  }
}

// DELETE - Remove labour from project trade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const labourId = parseInt(id);

    if (isNaN(labourId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid labour assignment ID' },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const existingAssignment = await prisma.projectLabour.findUnique({
      where: { id: labourId }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Project labour assignment not found' },
        { status: 404 }
      );
    }

    // Delete the assignment
    await prisma.projectLabour.delete({
      where: { id: labourId },
    });

    return NextResponse.json({ success: true, message: 'Labour assignment removed successfully' });
  } catch (error) {
    console.error('Error deleting project labour assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project labour assignment' },
      { status: 500 }
    );
  }
}

