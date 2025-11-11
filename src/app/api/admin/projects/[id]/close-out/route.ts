import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';

const orderByClause = [
  { sortOrder: 'asc' as const },
  { id: 'asc' as const },
];

async function resolveAuthorizedUser(request: NextRequest, projectId: number) {
  let userId: number | null = null;

  try {
    const token =
      request.cookies.get('adminToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = verifyToken(token);
      userId = decoded?.userId || null;
    }
  } catch (error) {
    console.warn('Invalid token in project close out request');
  }

  if (!userId) {
    return { authorized: false, status: 401, message: 'Unauthorized' as const };
  }

  const hasAccess = await hasProjectAccess(userId, projectId);
  if (!hasAccess) {
    return { authorized: false, status: 403, message: 'Access denied' as const };
  }

  return { authorized: true } as const;
}

function parseOptionalInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const rounded = Math.round(numeric);
  return rounded < 0 ? 0 : rounded;
}

function normalizeItemType(value: unknown, fallback?: string): string {
  const fromValue = typeof value === 'string' ? value.trim() : '';
  if (fromValue) return fromValue;
  return fallback ?? '';
}

type SanitizedCloseOutEntry = {
  itemType: string;
  totalRequired: number | null;
  submitted: number | null;
  approved: number | null;
  underReview: number | null;
  rejected: number | null;
  sortOrder: number;
};

function sanitizeCloseOutEntries(rawEntries: any[]): SanitizedCloseOutEntry[] {
  return rawEntries
    .map((entry: any, index: number) => {
      const itemType = normalizeItemType(entry?.itemType);
      if (!itemType) return null;

      return {
        itemType,
        totalRequired: parseOptionalInteger(entry?.totalRequired),
        submitted: parseOptionalInteger(entry?.submitted),
        approved: parseOptionalInteger(entry?.approved),
        underReview: parseOptionalInteger(entry?.underReview),
        rejected: parseOptionalInteger(entry?.rejected),
        sortOrder: typeof entry?.sortOrder === 'number' ? entry.sortOrder : index,
      };
    })
    .filter(Boolean) as SanitizedCloseOutEntry[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

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

    const entries = await prisma.projectCloseOutEntry.findMany({
      where: { projectId },
      orderBy: orderByClause,
    });

    return NextResponse.json({
      success: true,
      data: {
        entries,
      },
    });
  } catch (error) {
    console.error('Error fetching project close out data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project close out data' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

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
    const rawEntries = Array.isArray(body?.entries) ? body.entries : [];

    const sanitizedEntries = sanitizeCloseOutEntries(rawEntries);

    const nextEntries = await prisma.$transaction(async (tx) => {
      await tx.projectCloseOutEntry.deleteMany({ where: { projectId } });

      if (sanitizedEntries.length > 0) {
        await tx.projectCloseOutEntry.createMany({
          data: sanitizedEntries.map((entry) => ({
            projectId,
            itemType: entry.itemType,
            totalRequired: entry.totalRequired,
            submitted: entry.submitted,
            approved: entry.approved,
            underReview: entry.underReview,
            rejected: entry.rejected,
            sortOrder: entry.sortOrder,
          })),
        });
      }

      const freshEntries = await tx.projectCloseOutEntry.findMany({
        where: { projectId },
        orderBy: orderByClause,
      });

      return freshEntries;
    });

    return NextResponse.json({
      success: true,
      data: {
        entries: nextEntries,
      },
    });
  } catch (error) {
    console.error('Error updating project close out data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project close out data' },
      { status: 500 }
    );
  }
}

