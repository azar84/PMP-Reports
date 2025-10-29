import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
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

    const movementHistory = await prisma.staffMovementHistory.findMany({
      where: { staffId: staffId },
      orderBy: {
        movementDate: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: movementHistory });
  } catch (error) {
    console.error('Error fetching movement history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch movement history' },
      { status: 500 }
    );
  }
}

