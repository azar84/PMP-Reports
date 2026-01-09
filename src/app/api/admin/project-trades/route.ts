import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const addTradeSchema = z.object({
  projectId: z.number().int().positive(),
  trade: z.string().min(1, 'Trade name is required'),
  requiredQuantity: z.number().int().min(1).optional().default(1),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

// GET - Fetch all trades for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const projectTrades = await prisma.projectTrade.findMany({
      where: { projectId: parseInt(projectId) },
      include: {
        labourAssignments: {
          include: {
            labour: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        trade: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: projectTrades });
  } catch (error) {
    console.error('Error fetching project trades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project trades' },
      { status: 500 }
    );
  }
}

// POST - Add a trade to a project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = addTradeSchema.parse(body);

    const trade = await prisma.projectTrade.create({
      data: {
        projectId: validatedData.projectId,
        trade: validatedData.trade,
        requiredQuantity: validatedData.requiredQuantity,
        startDate: parseDate(validatedData.startDate),
        endDate: parseDate(validatedData.endDate),
      },
    });

    return NextResponse.json({ success: true, data: trade });
  } catch (error) {
    console.error('Error adding trade to project:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'This trade is already added to the project' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to add trade to project' },
      { status: 500 }
    );
  }
}

