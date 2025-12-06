import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const labourId = parseInt(id as string, 10);

    if (!id || Number.isNaN(labourId) || labourId <= 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const history = await prisma.leaveHistory.findMany({
      where: { labourId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        leaveStartDate: true,
        leaveEndDate: true,
        returnDate: true,
        isReturned: true,
        notes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    console.error('Error fetching labour leave history:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leave history' }, { status: 500 });
  }
}


