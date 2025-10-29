import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { parseDateFromInput } from '@/lib/dateUtils';

const moveStaffSchema = z.object({
  fromProjectStaffId: z.number().int().positive(),
  toProjectId: z.number().int().positive(),
  toPositionId: z.number().int().positive(),
  notes: z.string().optional().nullable(),
  movedBy: z.string().optional().nullable(),
  movementDate: z.string().optional().nullable(), // Optional custom movement date
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);

    if (isNaN(staffId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid staff ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = moveStaffSchema.parse(body);

    // Verify the staff exists
    const staff = await prisma.companyStaff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, error: 'Staff not found' },
        { status: 404 }
      );
    }

    // Get the current assignment (from project)
    const fromAssignment = await prisma.projectStaff.findUnique({
      where: { id: validatedData.fromProjectStaffId },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
        position: {
          select: {
            id: true,
            designation: true,
          },
        },
      },
    });

    if (!fromAssignment) {
      return NextResponse.json(
        { success: false, error: 'Source project assignment not found' },
        { status: 404 }
      );
    }

    if (fromAssignment.staffId !== staffId) {
      return NextResponse.json(
        { success: false, error: 'Staff ID mismatch' },
        { status: 400 }
      );
    }

    // Get the target project and position
    const targetPosition = await prisma.projectPosition.findUnique({
      where: { id: validatedData.toPositionId },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
      },
    });

    if (!targetPosition) {
      return NextResponse.json(
        { success: false, error: 'Target position not found' },
        { status: 404 }
      );
    }

    if (targetPosition.projectId !== validatedData.toProjectId) {
      return NextResponse.json(
        { success: false, error: 'Position does not belong to the specified project' },
        { status: 400 }
      );
    }

    // Check if staff is already assigned to the target project
    const existingAssignment = await prisma.projectStaff.findFirst({
      where: {
        projectId: validatedData.toProjectId,
        staffId: staffId,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Staff is already assigned to this project' },
        { status: 409 }
      );
    }

    // Use a transaction to move the staff and create history
    const result = await prisma.$transaction(async (tx) => {
      // Delete the old assignment
      await tx.projectStaff.delete({
        where: { id: validatedData.fromProjectStaffId },
      });

      // Create the new assignment
      const newAssignment = await tx.projectStaff.create({
        data: {
          projectId: validatedData.toProjectId,
          positionId: validatedData.toPositionId,
          staffId: staffId,
          utilization: fromAssignment.utilization,
          startDate: new Date(),
          endDate: fromAssignment.endDate,
          status: 'Active',
          notes: validatedData.notes || null,
        },
        include: {
          staff: true,
          position: true,
          project: {
            select: {
              id: true,
              projectName: true,
              projectCode: true,
            },
          },
        },
      });

      // Create movement history record
      // Use provided movementDate or current date (parsed as date-only, no timezone conversion)
      const movementDate = validatedData.movementDate && validatedData.movementDate !== ''
        ? (parseDateFromInput(validatedData.movementDate) || new Date())
        : new Date();
      
      const movementHistory = await tx.staffMovementHistory.create({
        data: {
          staffId: staffId,
          type: 'movement',
          fromProjectId: fromAssignment.projectId,
          fromProjectName: fromAssignment.project.projectName,
          fromPositionId: fromAssignment.positionId,
          fromPositionName: fromAssignment.position.designation,
          toProjectId: validatedData.toProjectId,
          toProjectName: targetPosition.project.projectName,
          toPositionId: validatedData.toPositionId,
          toPositionName: targetPosition.designation,
          movedBy: validatedData.movedBy || null,
          notes: validatedData.notes || null,
          movementDate: movementDate,
          projectStaffId: newAssignment.id,
        },
      });

      return { newAssignment, movementHistory };
    });

    return NextResponse.json({
      success: true,
      data: result.newAssignment,
      message: 'Staff moved successfully',
    });
  } catch (error) {
    console.error('Error moving staff:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to move staff' },
      { status: 500 }
    );
  }
}

