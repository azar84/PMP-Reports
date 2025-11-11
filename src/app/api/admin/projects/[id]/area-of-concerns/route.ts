import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';

type RouteParams = Promise<{ id: string }>;

async function resolveAuthorizedUser(request: NextRequest, projectId: number) {
  let userId: number | null = null;

  try {
    const token =
      request.cookies.get('adminToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = verifyToken(token);
      userId = decoded?.userId ?? null;
    }
  } catch {
    // ignore invalid token and fall through to unauthorized response
  }

  if (!userId) {
    return { authorized: false, status: 401, message: 'Unauthorized' as const };
  }

  const allowed = await hasProjectAccess(userId, projectId);
  if (!allowed) {
    return { authorized: false, status: 403, message: 'Access denied' as const };
  }

  return { authorized: true } as const;
}

function sanitizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export async function GET(request: NextRequest, { params }: { params: RouteParams }) {
  try {
    const { id } = await params;
    const projectId = Number.parseInt(id, 10);

    if (Number.isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const auth = await resolveAuthorizedUser(request, projectId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const areaOfConcerns = await prisma.projectAreaOfConcern.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: {
        areaOfConcerns,
      },
    });
  } catch (error) {
    console.error('Error fetching project area of concerns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project area of concerns' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: RouteParams }) {
  try {
    const { id } = await params;
    const projectId = Number.parseInt(id, 10);

    if (Number.isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const auth = await resolveAuthorizedUser(request, projectId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const rawAreaOfConcerns = Array.isArray(body?.areaOfConcerns) ? body.areaOfConcerns : [];

    const sanitizedAreaOfConcerns = rawAreaOfConcerns
      .map((entry: any, index: number) => {
        const description = sanitizeString(entry?.description);
        const actionNeeded = sanitizeString(entry?.actionNeeded);
        const startedDate = sanitizeDate(entry?.startedDate);
        const resolutionDate = sanitizeDate(entry?.resolutionDate);
        const status = sanitizeString(entry?.status) || 'Ongoing';
        const remarks = sanitizeString(entry?.remarks);

        // Validate status
        const validStatuses = ['Ongoing', 'Resolved', 'In Progress'];
        const finalStatus = validStatuses.includes(status) ? status : 'Ongoing';

        if (!description && !actionNeeded && !remarks) {
          return null;
        }

        return {
          projectId,
          description: description ?? 'Area of Concern',
          actionNeeded,
          startedDate,
          resolutionDate,
          status: finalStatus,
          remarks,
          sortOrder: typeof entry?.sortOrder === 'number' ? entry.sortOrder : index,
        };
      })
      .filter(Boolean) as Array<{
        projectId: number;
        description: string;
        actionNeeded: string | null;
        startedDate: Date | null;
        resolutionDate: Date | null;
        status: string;
        remarks: string | null;
        sortOrder: number;
      }>;

    const nextAreaOfConcerns = await prisma.$transaction(async (tx) => {
      await tx.projectAreaOfConcern.deleteMany({ where: { projectId } });

      if (sanitizedAreaOfConcerns.length > 0) {
        await tx.projectAreaOfConcern.createMany({
          data: sanitizedAreaOfConcerns.map((entry) => ({
            projectId: entry.projectId,
            description: entry.description,
            actionNeeded: entry.actionNeeded,
            startedDate: entry.startedDate,
            resolutionDate: entry.resolutionDate,
            status: entry.status,
            remarks: entry.remarks,
            sortOrder: entry.sortOrder,
          })),
        });
      }

      return tx.projectAreaOfConcern.findMany({
        where: { projectId },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        areaOfConcerns: nextAreaOfConcerns,
      },
    });
  } catch (error) {
    console.error('Error updating project area of concerns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project area of concerns' },
      { status: 500 }
    );
  }
}

