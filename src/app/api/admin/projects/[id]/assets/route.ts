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
    console.warn('Invalid token in project assets request');
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

function normalizeString(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  return fallback;
}

type SanitizedAssetEntry = {
  type: string;
  description: string;
  assetNumber: string | null;
  status: string;
  sortOrder: number;
};

function sanitizeAssetEntries(rawEntries: any[]): SanitizedAssetEntry[] {
  return rawEntries
    .map((entry: any, index: number) => {
      const type = normalizeString(entry?.type);
      const description = normalizeString(entry?.description);
      
      if (!type && !description) return null;

      return {
        type: type || 'Unspecified',
        description: description || 'Unspecified',
        assetNumber: entry?.assetNumber ? normalizeString(entry.assetNumber) : null,
        status: normalizeString(entry?.status, 'Active'),
        sortOrder: typeof entry?.sortOrder === 'number' ? entry.sortOrder : index,
      };
    })
    .filter(Boolean) as SanitizedAssetEntry[];
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

    const entries = await prisma.projectAsset.findMany({
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
    console.error('Error fetching project assets data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project assets data' },
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

    const sanitizedEntries = sanitizeAssetEntries(rawEntries);

    const nextEntries = await prisma.$transaction(async (tx) => {
      await tx.projectAsset.deleteMany({ where: { projectId } });

      if (sanitizedEntries.length > 0) {
        await tx.projectAsset.createMany({
          data: sanitizedEntries.map((entry) => ({
            projectId,
            type: entry.type,
            description: entry.description,
            assetNumber: entry.assetNumber,
            status: entry.status,
            sortOrder: entry.sortOrder,
          })),
        });
      }

      const freshEntries = await tx.projectAsset.findMany({
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
    console.error('Error updating project assets data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project assets data' },
      { status: 500 }
    );
  }
}

