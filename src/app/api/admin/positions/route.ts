import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const positionSchema = z.object({
  name: z.string().min(1, 'Position name is required'),
  description: z.string().optional().or(z.literal('')),
  monthlyRate: z.number().min(0, 'Monthly rate must be positive').optional().or(z.literal(null)),
});

// GET - Fetch all positions
export async function GET() {
  try {
    const positions = await prisma.position.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: positions });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

// POST - Create new position
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = positionSchema.parse(body);

    const position = await prisma.position.create({
      data: {
        name: validatedData.name.trim(),
        description: validatedData.description?.trim() || null,
        monthlyRate: validatedData.monthlyRate || null,
      },
    });

    return NextResponse.json({ success: true, data: position });
  } catch (error) {
    console.error('Error creating position:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Position name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create position' },
      { status: 500 }
    );
  }
}
