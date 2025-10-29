import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { parseDateFromInput } from '@/lib/dateUtils';

const assignLabourSchema = z.object({
  tradeId: z.number().int().positive(),
  labourId: z.number().int().positive(),
  utilization: z.number().int().min(0).max(100).default(100),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.string().default('Active'),
  notes: z.string().optional().nullable(),
});

// GET - Fetch all labours for a project
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

    const projectLabours = await prisma.projectLabour.findMany({
      where: { projectId: parseInt(projectId) },
      include: {
        labour: true,
        trade: {
          select: {
            trade: true,
            requiredUtilization: true,
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: projectLabours });
  } catch (error) {
    console.error('Error fetching project labours:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project labours' },
      { status: 500 }
    );
  }
}

// POST - Assign labour to a project trade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = assignLabourSchema.parse(body);

    // Check if labour is already assigned to this trade
    const existingAssignment = await prisma.projectLabour.findFirst({
      where: {
        projectId: (await prisma.projectTrade.findUnique({ where: { id: validatedData.tradeId } }))?.projectId,
        labourId: validatedData.labourId,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'This labour is already assigned to this project' },
        { status: 409 }
      );
    }

    // Get the trade to get the projectId
    const trade = await prisma.projectTrade.findUnique({
      where: { id: validatedData.tradeId },
      select: { projectId: true },
    });

    if (!trade) {
      return NextResponse.json(
        { success: false, error: 'Trade not found' },
        { status: 404 }
      );
    }

    // Use transaction to create assignment and history record
    const result = await prisma.$transaction(async (tx) => {
      const labourAssignment = await tx.projectLabour.create({
        data: {
          projectId: trade.projectId,
          tradeId: validatedData.tradeId,
          labourId: validatedData.labourId,
          utilization: validatedData.utilization,
          startDate: parseDateFromInput(validatedData.startDate),
          endDate: parseDateFromInput(validatedData.endDate),
          status: validatedData.status,
          notes: validatedData.notes || null,
        },
        include: {
          labour: true,
          trade: {
            select: {
              trade: true,
              project: {
                select: {
                  id: true,
                  projectName: true,
                },
              },
            },
          },
        },
      });

      // Create assignment history record
      await tx.labourMovementHistory.create({
        data: {
          labourId: validatedData.labourId,
          type: 'assignment',
          fromProjectId: null,
          fromProjectName: null,
          fromTradeId: null,
          fromTradeName: null,
          toProjectId: trade.projectId,
          toProjectName: labourAssignment.trade.project.projectName,
          toTradeId: validatedData.tradeId,
          toTradeName: labourAssignment.trade.trade,
          movedBy: null,
          movementDate: validatedData.startDate && validatedData.startDate !== '' 
            ? parseDateFromInput(validatedData.startDate) || new Date()
            : new Date(),
          notes: validatedData.notes || null,
          projectLabourId: labourAssignment.id,
        },
      });

      return labourAssignment;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error assigning labour:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'This labour is already assigned to this trade' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to assign labour' },
      { status: 500 }
    );
  }
}

