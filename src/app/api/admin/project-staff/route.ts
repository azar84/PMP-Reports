import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for project staff validation
const projectStaffSchema = z.object({
  projectId: z.number().int().positive(),
  staffId: z.number().int().positive().nullable(),
  designation: z.string().min(1, 'Designation is required'),
  utilization: z.number().int().min(0).max(100).default(100),
  startDate: z.string().optional().nullable().or(z.literal('')),
  endDate: z.string().optional().nullable().or(z.literal('')),
  status: z.string().default('Active'),
  notes: z.string().optional().nullable().or(z.literal('')),
});

// GET - Fetch project staff
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

    const projectStaff = await prisma.projectStaff.findMany({
      where: { projectId: parseInt(projectId) },
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
      orderBy: [
        { designation: 'asc' },
        { staff: { staffName: 'asc' } },
      ],
    });

    return NextResponse.json({
      success: true,
      data: projectStaff,
      message: 'Project staff retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching project staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project staff' },
      { status: 500 }
    );
  }
}

// POST - Add staff to project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = projectStaffSchema.parse(body);

    // Check if there's already a position with the same designation for this project
    // For unassigned positions (staffId = null), we allow multiple
    // For assigned positions, we check if the same staff is already assigned to the same designation
    const existingAssignment = await prisma.projectStaff.findFirst({
      where: {
        projectId: validatedData.projectId,
        designation: validatedData.designation,
        staffId: validatedData.staffId, // This will be null for unassigned positions
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Staff member is already assigned to this project with the same designation' },
        { status: 400 }
      );
    }

    const projectStaff = await prisma.projectStaff.create({
      data: {
        ...validatedData,
        startDate: validatedData.startDate && validatedData.startDate !== '' ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate && validatedData.endDate !== '' ? new Date(validatedData.endDate) : null,
        notes: validatedData.notes && validatedData.notes !== '' ? validatedData.notes : null,
        updatedAt: new Date(),
      },
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
      data: projectStaff,
      message: 'Staff added to project successfully',
    });
  } catch (error) {
    console.error('Error adding staff to project:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to add staff to project' },
      { status: 500 }
    );
  }
}
