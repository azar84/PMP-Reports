import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch report by share token (public, no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;

    if (!shareToken) {
      return NextResponse.json(
        { success: false, error: 'Share token is required' },
        { status: 400 }
      );
    }

    const report = await prisma.projectReport.findUnique({
      where: { shareToken },
      include: {
        project: {
          select: {
            id: true,
            projectCode: true,
            projectName: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching shared report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

