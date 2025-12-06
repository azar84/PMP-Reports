import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const tradeSchema = z.object({
  name: z.string().min(1, 'Trade name is required'),
  description: z.string().optional().or(z.literal('')),
  monthlyRate: z.number().min(0, 'Monthly rate must be positive').optional().or(z.literal(null)),
  isActive: z.boolean().optional(),
});

// GET - Fetch single trade
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid trade ID' },
        { status: 400 }
      );
    }

    const trade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!trade) {
      return NextResponse.json(
        { success: false, error: 'Trade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: trade });
  } catch (error) {
    console.error('Error fetching trade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trade' },
      { status: 500 }
    );
  }
}

// PUT - Update trade
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid trade ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = tradeSchema.parse(body);

    const trade = await prisma.trade.update({
      where: { id },
      data: {
        name: validatedData.name.trim(),
        description: validatedData.description?.trim() || null,
        monthlyRate: validatedData.monthlyRate || null,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json({ success: true, data: trade });
  } catch (error) {
    console.error('Error updating trade:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Trade not found' },
        { status: 404 }
      );
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Trade name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update trade' },
      { status: 500 }
    );
  }
}

// DELETE - Delete trade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid trade ID' },
        { status: 400 }
      );
    }

    await prisma.trade.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trade:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Trade not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete trade' },
      { status: 500 }
    );
  }
}

