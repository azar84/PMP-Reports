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

// GET - Fetch all company staff
export async function GET() {
  try {
    const staff = await prisma.companyStaff.findMany({
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
            position: {
              select: {
                id: true,
                designation: true,
                requiredUtilization: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate total utilization for each staff member
    const staffWithUtilization = staff.map(member => {
      const totalUtilization = member.projectStaff.reduce((sum, assignment) => sum + assignment.utilization, 0);
      const remainingCapacity = Math.max(0, 100 - totalUtilization);
      
      return {
        ...member,
        totalUtilization,
        remainingCapacity,
      };
    });

    return NextResponse.json({ success: true, data: staffWithUtilization });
  } catch (error) {
    console.error('Error fetching company staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company staff' },
      { status: 500 }
    );
  }
}

// POST - Create new company staff
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = staffSchema.parse(body);

    const staff = await prisma.companyStaff.create({
      data: validatedData,
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
            position: {
              select: {
                id: true,
                designation: true,
                requiredUtilization: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error creating company staff:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create company staff' },
      { status: 500 }
    );
  }
}
