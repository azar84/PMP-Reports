import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const labourSchema = z.object({
  labourName: z.string().min(1, 'Labour name is required'),
  employeeNumber: z.string().optional().or(z.literal('')),
  phone: z.string().optional(),
  trade: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET - Fetch single labour
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid labour ID' },
        { status: 400 }
      );
    }

    const labour = await prisma.labour.findUnique({
      where: { id },
    });

    if (!labour) {
      return NextResponse.json(
        { success: false, error: 'Labour not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: labour });
  } catch (error) {
    console.error('Error fetching labour:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch labour' },
      { status: 500 }
    );
  }
}

// PUT - Update labour
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid labour ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = labourSchema.parse(body);

    const labour = await prisma.labour.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({ success: true, data: labour });
  } catch (error) {
    console.error('Error updating labour:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Labour not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update labour' },
      { status: 500 }
    );
  }
}

// DELETE - Delete labour
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid labour ID' },
        { status: 400 }
      );
    }

    await prisma.labour.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting labour:', error);
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Labour not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete labour' },
      { status: 500 }
    );
  }
}

