import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const updatePositionSchema = z.object({
  name: z.string().min(1, 'Position name is required').optional(),
  description: z.string().optional().or(z.literal('')),
  monthlyRate: z.number().min(0, 'Monthly rate must be positive').optional().or(z.literal(null)),
  isActive: z.boolean().optional(),
});

// GET - Fetch single position by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const positionId = parseInt(id);
    
    if (isNaN(positionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position ID' },
        { status: 400 }
      );
    }

    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return NextResponse.json(
        { success: false, error: 'Position not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: position });
  } catch (error) {
    console.error('Error fetching position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch position' },
      { status: 500 }
    );
  }
}

// PUT - Update position
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const positionId = parseInt(id);
    
    if (isNaN(positionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updatePositionSchema.parse(body);

    // Check if position exists
    const existingPosition = await prisma.position.findUnique({
      where: { id: positionId }
    });

    if (!existingPosition) {
      return NextResponse.json(
        { success: false, error: 'Position not found' },
        { status: 404 }
      );
    }

    const position = await prisma.position.update({
      where: { id: positionId },
      data: {
        ...validatedData,
        name: validatedData.name?.trim(),
        description: validatedData.description?.trim() || null,
        monthlyRate: validatedData.monthlyRate || null,
      },
    });

    return NextResponse.json({ success: true, data: position });
  } catch (error) {
    console.error('Error updating position:', error);
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
      { success: false, error: 'Failed to update position' },
      { status: 500 }
    );
  }
}

// DELETE - Delete position
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const positionId = parseInt(id);
    
    if (isNaN(positionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position ID' },
        { status: 400 }
      );
    }

    // Check if position exists
    const existingPosition = await prisma.position.findUnique({
      where: { id: positionId }
    });

    if (!existingPosition) {
      return NextResponse.json(
        { success: false, error: 'Position not found' },
        { status: 404 }
      );
    }

    await prisma.position.delete({
      where: { id: positionId },
    });

    return NextResponse.json({ success: true, message: 'Position deleted successfully' });
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete position' },
      { status: 500 }
    );
  }
}
