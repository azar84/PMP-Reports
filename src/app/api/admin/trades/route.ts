import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const tradeSchema = z.object({
  name: z.string().min(1, 'Trade name is required'),
  description: z.string().optional().or(z.literal('')),
  monthlyRate: z.number().min(0, 'Monthly rate must be positive').optional().or(z.literal(null)),
});

// GET - Fetch all trades
export async function GET() {
  try {
    const trades = await prisma.trade.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: trades });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

// POST - Create new trade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = tradeSchema.parse(body);

    const trade = await prisma.trade.create({
      data: {
        name: validatedData.name.trim(),
        description: validatedData.description?.trim() || null,
        monthlyRate: validatedData.monthlyRate || null,
      },
    });

    return NextResponse.json({ success: true, data: trade });
  } catch (error) {
    console.error('Error creating trade:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Trade name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create trade' },
      { status: 500 }
    );
  }
}

