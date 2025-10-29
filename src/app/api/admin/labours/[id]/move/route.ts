import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { parseDateFromInput } from '@/lib/dateUtils';

const moveLabourSchema = z.object({
  fromProjectLabourId: z.number().int().positive(),
  toProjectId: z.number().int().positive(),
  toTradeId: z.number().int().positive(),
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
    const labourId = parseInt(id);

    if (isNaN(labourId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid labour ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = moveLabourSchema.parse(body);

    // Verify the labour exists
    const labour = await prisma.labour.findUnique({
      where: { id: labourId },
    });

    if (!labour) {
      return NextResponse.json(
        { success: false, error: 'Labour not found' },
        { status: 404 }
      );
    }

    // Get the current assignment (from project)
    const fromAssignment = await prisma.projectLabour.findUnique({
      where: { id: validatedData.fromProjectLabourId },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
        trade: {
          select: {
            id: true,
            trade: true,
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

    if (fromAssignment.labourId !== labourId) {
      return NextResponse.json(
        { success: false, error: 'Labour ID mismatch' },
        { status: 400 }
      );
    }

    // Get the target project and trade
    const targetTrade = await prisma.projectTrade.findUnique({
      where: { id: validatedData.toTradeId },
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

    if (!targetTrade) {
      return NextResponse.json(
        { success: false, error: 'Target trade not found' },
        { status: 404 }
      );
    }

    if (targetTrade.projectId !== validatedData.toProjectId) {
      return NextResponse.json(
        { success: false, error: 'Trade does not belong to the specified project' },
        { status: 400 }
      );
    }

    // Check if labour is already assigned to the target project
    const existingAssignment = await prisma.projectLabour.findFirst({
      where: {
        projectId: validatedData.toProjectId,
        labourId: labourId,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Labour is already assigned to this project' },
        { status: 409 }
      );
    }

    // Use a transaction to move the labour and create history
    const result = await prisma.$transaction(async (tx) => {
      // Delete the old assignment
      await tx.projectLabour.delete({
        where: { id: validatedData.fromProjectLabourId },
      });

      // Create the new assignment
      const newAssignment = await tx.projectLabour.create({
        data: {
          projectId: validatedData.toProjectId,
          tradeId: validatedData.toTradeId,
          labourId: labourId,
          utilization: fromAssignment.utilization,
          startDate: new Date(),
          endDate: fromAssignment.endDate,
          status: 'Active',
          notes: validatedData.notes || null,
        },
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

      // Create movement history record
      // Use provided movementDate or current date (parsed as date-only, no timezone conversion)
      const movementDate = validatedData.movementDate && validatedData.movementDate !== ''
        ? (parseDateFromInput(validatedData.movementDate) || new Date())
        : new Date();
      
      const movementHistory = await tx.labourMovementHistory.create({
        data: {
          labourId: labourId,
          type: 'movement',
          fromProjectId: fromAssignment.projectId,
          fromProjectName: fromAssignment.project.projectName,
          fromTradeId: fromAssignment.tradeId,
          fromTradeName: fromAssignment.trade.trade,
          toProjectId: validatedData.toProjectId,
          toProjectName: targetTrade.project.projectName,
          toTradeId: validatedData.toTradeId,
          toTradeName: targetTrade.trade,
          movedBy: validatedData.movedBy || null,
          notes: validatedData.notes || null,
          movementDate: movementDate,
          projectLabourId: newAssignment.id,
        },
      });

      return { newAssignment, movementHistory };
    });

    return NextResponse.json({
      success: true,
      data: result.newAssignment,
      message: 'Labour moved successfully',
    });
  } catch (error) {
    console.error('Error moving labour:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to move labour' },
      { status: 500 }
    );
  }
}

