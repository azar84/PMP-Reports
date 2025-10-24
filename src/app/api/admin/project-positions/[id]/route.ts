import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for updating project position
const updatePositionSchema = z.object({
  requiredUtilization: z.number().int().min(0).optional(),
});

// GET - Fetch specific project position
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const positionId = parseInt(params.id);

    const position = await prisma.projectPosition.findUnique({
      where: { id: positionId },
      include: {
        staffAssignments: {
          include: {
            staff: true,
          },
        },
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
      },
    });

    if (!position) {
      return NextResponse.json(
        { success: false, error: 'Project position not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: position,
      message: 'Project position retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching project position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project position' },
      { status: 500 }
    );
  }
}

// PUT - Update project position
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const positionId = parseInt(id);
    const body = await request.json();
    const validatedData = updatePositionSchema.parse(body);

    // Check if the position exists
    const existingPosition = await prisma.projectPosition.findUnique({
      where: { id: positionId },
    });

    if (!existingPosition) {
      return NextResponse.json(
        { success: false, error: 'Project position not found' },
        { status: 404 }
      );
    }

    const updatedPosition = await prisma.projectPosition.update({
      where: { id: positionId },
      data: validatedData,
      include: {
        staffAssignments: {
          include: {
            staff: true,
          },
        },
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPosition,
      message: 'Project position updated successfully',
    });
  } catch (error) {
    console.error('Error updating project position:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update project position' },
      { status: 500 }
    );
  }
}

// DELETE - Delete project position
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const positionId = parseInt(id);

    // Check if the position exists
    const existingPosition = await prisma.projectPosition.findUnique({
      where: { id: positionId },
    });

    if (!existingPosition) {
      return NextResponse.json(
        { success: false, error: 'Project position not found' },
        { status: 404 }
      );
    }

    await prisma.projectPosition.delete({
      where: { id: positionId },
    });

    return NextResponse.json({
      success: true,
      message: 'Project position deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project position' },
      { status: 500 }
    );
  }
}
