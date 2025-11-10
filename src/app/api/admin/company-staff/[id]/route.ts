import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

const staffSchema = z.object({
  staffName: z.string().min(1, 'Staff name is required'),
  employeeNumber: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  position: z.string().optional(),
  positionId: z.number().optional().or(z.literal(null)),
  isActive: z.boolean().optional().default(true),
  monthlyBaseRate: z.number().min(0, 'Base rate must be a positive number').nullable().optional(),
});

// GET - Fetch single company staff
export async function GET(
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

    const staff = await prisma.companyStaff.findUnique({
      where: { id: staffId },
      include: {
        projectStaff: {
          include: {
            project: {
              select: {
                id: true,
                projectName: true,
                projectCode: true,
              },
            },
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

    const serializedStaff = {
      ...staff,
      monthlyBaseRate: staff.monthlyBaseRate ? Number(staff.monthlyBaseRate) : null,
    };

    return NextResponse.json({ success: true, data: serializedStaff });
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
    const validatedData = staffSchema.parse(body);
    const { monthlyBaseRate, position: rawPosition, positionId, ...rest } = validatedData;

    let positionName =
      typeof rawPosition === 'string' && rawPosition.trim().length > 0 ? rawPosition.trim() : undefined;

    if (!positionName && typeof positionId === 'number') {
      const matchingPosition = await prisma.position.findUnique({
        where: { id: positionId },
        select: { name: true },
      });
      positionName = matchingPosition?.name ?? undefined;
    }

    const staff = await prisma.companyStaff.update({
      where: { id: staffId },
      data: {
        ...rest,
        position: positionName ?? null,
        monthlyBaseRate:
          monthlyBaseRate !== undefined && monthlyBaseRate !== null ? new Prisma.Decimal(monthlyBaseRate) : null,
      },
      include: {
        projectStaff: {
          include: {
            project: {
              select: {
                id: true,
                projectName: true,
                projectCode: true,
              },
            },
          },
        },
      },
    });

    const serializedStaff = {
      ...staff,
      monthlyBaseRate: staff.monthlyBaseRate ? Number(staff.monthlyBaseRate) : null,
    };

    return NextResponse.json({ success: true, data: serializedStaff });
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

    // Check if staff has associated project assignments
    const projectStaffCount = await prisma.projectStaff.count({
      where: {
        staffId: staffId,
      },
    });

    if (projectStaffCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete staff with project assignments. Please remove all project assignments first.' },
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
