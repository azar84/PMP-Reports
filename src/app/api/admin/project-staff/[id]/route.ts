import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for updating project staff
const updateProjectStaffSchema = z.object({
  staffId: z.number().int().positive().nullable().optional(),
  designation: z.string().min(1, 'Designation is required').optional(),
  utilization: z.number().int().min(0).max(100).optional(),
  startDate: z.string().optional().nullable().or(z.literal('')),
  endDate: z.string().optional().nullable().or(z.literal('')),
  status: z.string().optional(),
  notes: z.string().optional().nullable().or(z.literal('')),
});

// GET - Fetch specific project staff assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectStaffId = parseInt(params.id);

    const projectStaff = await prisma.projectStaff.findUnique({
      where: { id: projectStaffId },
      include: {
        staff: true,
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
      },
    });

    if (!projectStaff) {
      return NextResponse.json(
        { success: false, error: 'Project staff assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: projectStaff,
      message: 'Project staff assignment retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching project staff assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project staff assignment' },
      { status: 500 }
    );
  }
}

// PUT - Update project staff assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectStaffId = parseInt(id);
    const body = await request.json();
    const validatedData = updateProjectStaffSchema.parse(body);

    // Check if the assignment exists
    const existingAssignment = await prisma.projectStaff.findUnique({
      where: { id: projectStaffId },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Project staff assignment not found' },
        { status: 404 }
      );
    }

    const updateData: any = { ...validatedData };
    
    // Handle date fields
    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null;
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    }

    const updatedProjectStaff = await prisma.projectStaff.update({
      where: { id: projectStaffId },
      data: updateData,
      include: {
        staff: true,
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
      data: updatedProjectStaff,
      message: 'Project staff assignment updated successfully',
    });
  } catch (error) {
    console.error('Error updating project staff assignment:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update project staff assignment' },
      { status: 500 }
    );
  }
}

// DELETE - Remove staff from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectStaffId = parseInt(id);

    // Check if the assignment exists
    const existingAssignment = await prisma.projectStaff.findUnique({
      where: { id: projectStaffId },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Project staff assignment not found' },
        { status: 404 }
      );
    }

    await prisma.projectStaff.delete({
      where: { id: projectStaffId },
    });

    return NextResponse.json({
      success: true,
      message: 'Staff removed from project successfully',
    });
  } catch (error) {
    console.error('Error removing staff from project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove staff from project' },
      { status: 500 }
    );
  }
}
