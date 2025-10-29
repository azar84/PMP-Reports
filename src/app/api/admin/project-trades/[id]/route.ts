import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateProjectTradeSchema = z.object({
  trade: z.string().min(1).optional(),
  requiredQuantity: z.number().int().min(1).optional(),
});

// GET - Fetch specific project trade
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tradeId = parseInt(id);

    if (isNaN(tradeId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid trade ID' },
        { status: 400 }
      );
    }

    const projectTrade = await prisma.projectTrade.findUnique({
      where: { id: tradeId },
      include: {
        labourAssignments: {
          include: {
            labour: true,
          },
        },
      },
    });

    if (!projectTrade) {
      return NextResponse.json(
        { success: false, error: 'Project trade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: projectTrade });
  } catch (error) {
    console.error('Error fetching project trade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project trade' },
      { status: 500 }
    );
  }
}

// PUT - Update project trade
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tradeId = parseInt(id);

    if (isNaN(tradeId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid trade ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateProjectTradeSchema.parse(body);

    const trade = await prisma.projectTrade.update({
      where: { id: tradeId },
      data: validatedData,
    });

    return NextResponse.json({ success: true, data: trade });
  } catch (error) {
    console.error('Error updating project trade:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update project trade' },
      { status: 500 }
    );
  }
}

// DELETE - Delete project trade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tradeId = parseInt(id);

    if (isNaN(tradeId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid trade ID' },
        { status: 400 }
      );
    }

    // Check if trade exists
    const existingTrade = await prisma.projectTrade.findUnique({
      where: { id: tradeId }
    });

    if (!existingTrade) {
      return NextResponse.json(
        { success: false, error: 'Project trade not found' },
        { status: 404 }
      );
    }

    // Delete the trade (this will cascade delete labour assignments)
    await prisma.projectTrade.delete({
      where: { id: tradeId },
    });

    return NextResponse.json({ success: true, message: 'Project trade deleted successfully' });
  } catch (error) {
    console.error('Error deleting project trade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project trade' },
      { status: 500 }
    );
  }
}

