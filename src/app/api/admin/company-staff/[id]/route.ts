import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const staffSchema = z.object({
  staffName: z.string().min(1, 'Staff name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  position: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

// GET - Fetch single company staff
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staffId = parseInt(params.id);
    
    if (isNaN(staffId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid staff ID' },
        { status: 400 }
      );
    }

    const staff = await prisma.companyStaff.findUnique({
      where: { id: staffId },
      include: {
        projectsAsDirector: {
          select: {
            id: true,
            projectName: true,
            startDate: true,
            endDate: true,
          },
        },
        projectsAsManager: {
          select: {
            id: true,
            projectName: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, error: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// PUT - Update company staff
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staffId = parseInt(params.id);
    
    if (isNaN(staffId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid staff ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = staffSchema.parse(body);

    const staff = await prisma.companyStaff.update({
      where: { id: staffId },
      data: validatedData,
      include: {
        projectsAsDirector: {
          select: {
            id: true,
            projectName: true,
          },
        },
        projectsAsManager: {
          select: {
            id: true,
            projectName: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error updating staff:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update staff' },
      { status: 500 }
    );
  }
}

// DELETE - Delete company staff
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staffId = parseInt(params.id);
    
    if (isNaN(staffId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid staff ID' },
        { status: 400 }
      );
    }

    // Check if staff has associated projects
    const projectsCount = await prisma.project.count({
      where: {
        OR: [
          { projectDirectorId: staffId },
          { projectManagerId: staffId },
        ],
      },
    });

    if (projectsCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete staff with associated projects' },
        { status: 400 }
      );
    }

    await prisma.companyStaff.delete({
      where: { id: staffId },
    });

    return NextResponse.json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete staff' },
      { status: 500 }
    );
  }
}
