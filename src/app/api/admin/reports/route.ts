import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

// Helper to get user from request
async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  return decoded;
}

// GET - Fetch all reports, optionally filtered by project
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where: any = {};
    if (projectId) {
      where.projectId = parseInt(projectId);
    }

    const reports = await prisma.projectReport.findMany({
      where,
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
      orderBy: [
        { reportYear: 'desc' },
        { reportMonth: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST - Create new report
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, reportMonth, reportYear, reportData } = body;

    if (!projectId || !reportMonth || !reportYear || !reportData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate month (1-12)
    if (reportMonth < 1 || reportMonth > 12) {
      return NextResponse.json(
        { success: false, error: 'Invalid month. Must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Check if report already exists for this project, month, and year
    const existingReport = await prisma.projectReport.findUnique({
      where: {
        projectId_reportMonth_reportYear: {
          projectId: parseInt(projectId),
          reportMonth: parseInt(reportMonth),
          reportYear: parseInt(reportYear),
        },
      },
    });

    if (existingReport) {
      // Update existing report
      const updatedReport = await prisma.projectReport.update({
        where: { id: existingReport.id },
        data: {
          reportData: reportData,
          userId: user.userId,
        },
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

      return NextResponse.json({ success: true, data: updatedReport });
    }

    // Create new report
    const report = await prisma.projectReport.create({
      data: {
        projectId: parseInt(projectId),
        userId: user.userId,
        reportMonth: parseInt(reportMonth),
        reportYear: parseInt(reportYear),
        reportData: reportData,
      },
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

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error('Error creating report:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Report already exists for this project, month, and year' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

