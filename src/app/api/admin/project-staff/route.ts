import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { parseDateFromInput } from '@/lib/dateUtils';

// Schema for creating a project position
const createPositionSchema = z.object({
  projectId: z.number().int().positive(),
  designation: z.string().min(1, 'Designation is required'),
  requiredUtilization: z.number().int().min(0).default(100), // Required total utilization for this position
});

// Schema for assigning staff to a position
const assignStaffSchema = z.object({
  positionId: z.number().int().positive(),
  staffId: z.number().int().positive(),
  utilization: z.number().int().min(0).default(100), // Staff utilization percentage
  startDate: z.string().optional().nullable().or(z.literal('')),
  endDate: z.string().optional().nullable().or(z.literal('')),
  status: z.string().default('Active'),
  notes: z.string().optional().nullable().or(z.literal('')),
});

// GET - Fetch project positions with their staff assignments
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

    const projectPositions = await prisma.projectPosition.findMany({
      where: { projectId: parseInt(projectId) },
      include: {
        staffAssignments: {
          include: {
            staff: true,
          },
          orderBy: {
            createdAt: 'asc',
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
      orderBy: [
        { designation: 'asc' },
      ],
    });

    // Fetch monthly rates from positions table and merge with project positions
    const positionsWithRates = await Promise.all(
      projectPositions.map(async (position) => {
        const positionData = await prisma.position.findUnique({
          where: { name: position.designation },
          select: { monthlyRate: true },
        });
        
        return {
          ...position,
          monthlyRate: positionData?.monthlyRate || null,
        };
      })
    );

    // Custom sorting: Project Director first, then Project Manager, then alphabetical
    const sortedPositions = positionsWithRates.sort((a, b) => {
      // Project Director always first
      if (a.designation === 'Project Director' && b.designation !== 'Project Director') {
        return -1;
      }
      if (b.designation === 'Project Director' && a.designation !== 'Project Director') {
        return 1;
      }
      
      // Project Manager second (but only if Project Director is not present)
      if (a.designation === 'Project Manager' && b.designation !== 'Project Manager' && b.designation !== 'Project Director') {
        return -1;
      }
      if (b.designation === 'Project Manager' && a.designation !== 'Project Manager' && a.designation !== 'Project Director') {
        return 1;
      }
      
      // For all other cases, maintain alphabetical order
      return a.designation.localeCompare(b.designation);
    });

    return NextResponse.json({
      success: true,
      data: sortedPositions,
      message: 'Project positions retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching project positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project positions' },
      { status: 500 }
    );
  }
}

// POST - Create a new position or assign staff to existing position
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a position creation or staff assignment
    if (body.positionId) {
      // This is a staff assignment to an existing position
      const validatedData = assignStaffSchema.parse(body);

      // Check if the same staff member is already assigned to this project
      const existingStaffAssignment = await prisma.projectStaff.findFirst({
        where: {
          projectId: {
            // We need to get the projectId from the position
            in: await prisma.projectPosition.findMany({
              where: { id: validatedData.positionId },
              select: { projectId: true },
            }).then(positions => positions.map(p => p.projectId)),
          },
          staffId: validatedData.staffId,
        },
      });

      if (existingStaffAssignment) {
        return NextResponse.json(
          { success: false, error: 'This staff member is already assigned to this project' },
          { status: 400 }
        );
      }

      // Get the position to get the projectId
      const position = await prisma.projectPosition.findUnique({
        where: { id: validatedData.positionId },
        select: { projectId: true },
      });

      if (!position) {
        return NextResponse.json(
          { success: false, error: 'Position not found' },
          { status: 404 }
        );
      }

      // Use transaction to create assignment and history record
      const result = await prisma.$transaction(async (tx) => {
        const staffAssignment = await tx.projectStaff.create({
          data: {
            projectId: position.projectId,
            positionId: validatedData.positionId,
            staffId: validatedData.staffId,
            utilization: validatedData.utilization,
            startDate: parseDateFromInput(validatedData.startDate),
            endDate: parseDateFromInput(validatedData.endDate),
            status: validatedData.status,
            notes: validatedData.notes && validatedData.notes !== '' ? validatedData.notes : null,
          },
          include: {
            staff: true,
            position: {
              select: {
                id: true,
                designation: true,
                project: {
                  select: {
                    id: true,
                    projectName: true,
                  },
                },
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

        // Create assignment history record
        await tx.staffMovementHistory.create({
          data: {
            staffId: validatedData.staffId,
            type: 'assignment',
            fromProjectId: null,
            fromProjectName: null,
            fromPositionId: null,
            fromPositionName: null,
            toProjectId: position.projectId,
            toProjectName: staffAssignment.project.projectName,
            toPositionId: validatedData.positionId,
            toPositionName: staffAssignment.position.designation,
            movedBy: null,
            movementDate: validatedData.startDate && validatedData.startDate !== '' 
              ? parseDateFromInput(validatedData.startDate) || new Date()
              : new Date(),
            notes: validatedData.notes && validatedData.notes !== '' ? validatedData.notes : null,
            projectStaffId: staffAssignment.id,
          },
        });

        return staffAssignment;
      });

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Staff assigned to position successfully',
      });
    } else {
      // This is creating a new position
      const validatedData = createPositionSchema.parse(body);

      // Check if position already exists for this project
      const existingPosition = await prisma.projectPosition.findFirst({
        where: {
          projectId: validatedData.projectId,
          designation: validatedData.designation,
        },
      });

      if (existingPosition) {
        return NextResponse.json(
          { success: false, error: 'This position already exists for this project' },
          { status: 400 }
        );
      }

      const position = await prisma.projectPosition.create({
        data: {
          projectId: validatedData.projectId,
          designation: validatedData.designation,
          requiredUtilization: validatedData.requiredUtilization,
        },
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
        data: position,
        message: 'Position created successfully',
      });
    }
  } catch (error) {
    console.error('Error creating position or assigning staff:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create position or assign staff' },
      { status: 500 }
    );
  }
}
