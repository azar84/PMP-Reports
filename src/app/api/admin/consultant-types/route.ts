import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const consultantTypeSchema = z.object({
  type: z.string().min(1, 'Consultant type is required'),
  description: z.string().optional(),
});

// GET - Fetch all consultant types
export async function GET() {
  try {
    const consultantTypes = await prisma.consultantType.findMany({
      include: {
        ConsultantToConsultantType: {
          include: {
            consultants: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        type: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: consultantTypes });
  } catch (error) {
    console.error('Error fetching consultant types:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consultant types' },
      { status: 500 }
    );
  }
}

// POST - Create new consultant type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = consultantTypeSchema.parse(body);

    const consultantType = await prisma.consultantType.create({
      data: validatedData,
      include: {
        ConsultantToConsultantType: {
          include: {
            consultants: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: consultantType });
  } catch (error) {
    console.error('Error creating consultant type:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create consultant type' },
      { status: 500 }
    );
  }
}
