import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

const labourSchema = z.object({
  labourName: z.string().min(1, 'Labour name is required'),
  employeeNumber: z.string().optional().or(z.literal('')),
  phone: z.string().optional(),
  trade: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  monthlyBaseRate: z.number().optional().nullable(),
});

// GET - Fetch all labours
export async function GET() {
  try {
    const labours = await prisma.labour.findMany({
      include: {
        projectLabours: {
          where: {
            status: {
              not: 'Completed'
            }
          },
          select: {
            id: true,
            status: true,
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
                requiredQuantity: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate utilization status for each labour
    const laboursWithStatus = labours.map(labour => {
      const activeAssignments = labour.projectLabours.filter(assignment => assignment.status === 'Active');
      const isUtilized = activeAssignments.length > 0;
      
      return {
        ...labour,
        isUtilized,
        activeProjectCount: activeAssignments.length,
        projectLabours: labour.projectLabours,
      };
    });

    return NextResponse.json({ success: true, data: laboursWithStatus });
  } catch (error) {
    console.error('Error fetching labours:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch labours' },
      { status: 500 }
    );
  }
}

// POST - Create new labour
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = labourSchema.parse(body);
    const { monthlyBaseRate, ...rest } = validatedData;

    const labour = await prisma.labour.create({
      data: {
        ...rest,
        monthlyBaseRate:
          monthlyBaseRate !== undefined && monthlyBaseRate !== null ? new Prisma.Decimal(monthlyBaseRate) : null,
      },
    });

    return NextResponse.json({ success: true, data: labour });
  } catch (error) {
    console.error('Error creating labour:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create labour' },
      { status: 500 }
    );
  }
}

