import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

const staffSchema = z.object({
  staffName: z.string().min(1, 'Staff name is required'),
  employeeNumber: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  positionId: z.number().optional().or(z.literal(null)),
  position: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
  monthlyBaseRate: z.number().min(0, 'Base rate must be a positive number').nullable().optional(),
});

// GET - Fetch all company staff
export async function GET() {
  try {
    const staff = await prisma.companyStaff.findMany({
      include: {
        projectStaff: {
          where: {
            status: {
              not: 'Completed'
            }
          },
          select: {
            id: true,
            utilization: true,
            status: true,
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
    const staffWithUtilization = staff.map((member) => {
      const totalUtilization = member.projectStaff.reduce((sum, assignment) => {
        return sum + (assignment.utilization || 0);
      }, 0);
      const remainingCapacity = Math.max(0, 100 - totalUtilization);
      
      return {
        ...member,
        totalUtilization,
        remainingCapacity,
        monthlyBaseRate: member.monthlyBaseRate ? Number(member.monthlyBaseRate) : null,
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
    const { monthlyBaseRate, positionId, position: rawPosition, ...rest } = validatedData;

    let positionName =
      typeof rawPosition === 'string' && rawPosition.trim().length > 0 ? rawPosition.trim() : undefined;

    if (!positionName && typeof positionId === 'number') {
      const matchingPosition = await prisma.position.findUnique({
        where: { id: positionId },
        select: { name: true },
      });
      positionName = matchingPosition?.name ?? undefined;
    }

    const staff = await prisma.companyStaff.create({
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

    const serializedStaff = {
      ...staff,
      monthlyBaseRate: staff.monthlyBaseRate ? Number(staff.monthlyBaseRate) : null,
    };

    return NextResponse.json({ success: true, data: serializedStaff });
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
