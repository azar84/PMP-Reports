import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const vacationSchema = z.object({
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

// PUT - Update vacation dates
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
    const validatedData = vacationSchema.parse(body);

    const staff = await prisma.companyStaff.update({
      where: { id: staffId },
      data: {
        vacationStartDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        vacationEndDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
    });

    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error updating vacation:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update vacation' },
      { status: 500 }
    );
  }
}

