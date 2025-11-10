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

    const risks = await prisma.projectRiskEntry.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: {
        risks,
      },
    });
  } catch (error) {
    console.error('Error fetching project risks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project risks' },
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
    const rawRisks = Array.isArray(body?.risks) ? body.risks : [];

    const sanitizedRisks = rawRisks
      .map((entry: any, index: number) => {
        const riskItem = sanitizeString(entry?.riskItem ?? entry?.title);
        const impact = sanitizeString(entry?.impact);
        const remarks = sanitizeString(entry?.remarks);

        if (!riskItem && !impact && !remarks) {
          return null;
        }

        return {
          projectId,
          riskItem: riskItem ?? 'Risk Item',
          impact,
          remarks,
          sortOrder: typeof entry?.sortOrder === 'number' ? entry.sortOrder : index,
        };
      })
      .filter(Boolean) as Array<{
        projectId: number;
        riskItem: string;
        impact: string | null;
        remarks: string | null;
        sortOrder: number;
      }>;

    const nextRisks = await prisma.$transaction(async (tx) => {
      await tx.projectRiskEntry.deleteMany({ where: { projectId } });

      if (sanitizedRisks.length > 0) {
        await tx.projectRiskEntry.createMany({
          data: sanitizedRisks.map((entry) => ({
            projectId: entry.projectId,
            riskItem: entry.riskItem,
            impact: entry.impact,
            remarks: entry.remarks,
            sortOrder: entry.sortOrder,
          })),
        });
      }

      return tx.projectRiskEntry.findMany({
        where: { projectId },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        risks: nextRisks,
      },
    });
  } catch (error) {
    console.error('Error updating project risks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project risks' },
      { status: 500 }
    );
  }
}

