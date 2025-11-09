import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';

const DEFAULT_E1_LOG_TYPES = [
  'Pre-Qualification',
  'Report',
  'Material Submittals',
  'Design Drawing',
  'Shop Drawing',
];

const DEFAULT_E2_LOG_TYPES = [
  'Consultant',
  'Third Party',
  'Sub Contractors',
  'Special Suppliers',
  'General Suppliers',
  'Long Lead Items',
];

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
    console.warn('Invalid token in project quality request');
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

function normalizeSubmissionType(value: unknown, fallback?: string): string {
  const fromValue = typeof value === 'string' ? value.trim() : '';
  if (fromValue) return fromValue;
  return fallback ?? '';
}

type SanitizedEntry = {
  submissionType: string;
  totalNumber: number | null;
  submitted: number | null;
  underReview: number | null;
  approved: number | null;
  reviseAndResubmit: number | null;
  sortOrder: number;
};

function sanitizeEntries(rawEntries: any[], defaultTypes: string[]): SanitizedEntry[] {
  return rawEntries
    .map((entry: any, index: number) => {
      const submissionType = normalizeSubmissionType(entry?.submissionType, defaultTypes[index]);
      if (!submissionType) return null;

      return {
        submissionType,
        totalNumber: parseOptionalInteger(entry?.totalNumber),
        submitted: parseOptionalInteger(entry?.submitted),
        underReview: parseOptionalInteger(entry?.underReview),
        approved: parseOptionalInteger(entry?.approved),
        reviseAndResubmit: parseOptionalInteger(entry?.reviseAndResubmit),
        sortOrder: typeof entry?.sortOrder === 'number' ? entry.sortOrder : index,
      };
    })
    .filter(Boolean) as SanitizedEntry[];
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

    const [e1Entries, e2Entries] = await Promise.all([
      prisma.projectQualityE1Log.findMany({
        where: { projectId },
        orderBy: orderByClause,
      }),
      prisma.projectQualityE2Log.findMany({
        where: { projectId },
        orderBy: orderByClause,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        e1Entries,
        e2Entries,
        defaultE1Types: DEFAULT_E1_LOG_TYPES,
        defaultE2Types: DEFAULT_E2_LOG_TYPES,
      },
    });
  } catch (error) {
    console.error('Error fetching project quality data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project quality data' },
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
    const rawE1Entries = Array.isArray(body?.e1Entries)
      ? body.e1Entries
      : Array.isArray(body?.entries)
        ? body.entries
        : [];
    const rawE2Entries = Array.isArray(body?.e2Entries) ? body.e2Entries : [];

    const sanitizedE1Entries = sanitizeEntries(rawE1Entries, DEFAULT_E1_LOG_TYPES);
    const sanitizedE2Entries = sanitizeEntries(rawE2Entries, DEFAULT_E2_LOG_TYPES);

    const [nextE1Entries, nextE2Entries] = await prisma.$transaction(async (tx) => {
      await tx.projectQualityE1Log.deleteMany({ where: { projectId } });
      await tx.projectQualityE2Log.deleteMany({ where: { projectId } });

      if (sanitizedE1Entries.length > 0) {
        await tx.projectQualityE1Log.createMany({
          data: sanitizedE1Entries.map((entry) => ({
            projectId,
            submissionType: entry.submissionType,
            totalNumber: entry.totalNumber,
            submitted: entry.submitted,
            underReview: entry.underReview,
            approved: entry.approved,
            reviseAndResubmit: entry.reviseAndResubmit,
            sortOrder: entry.sortOrder,
          })),
        });
      }

      if (sanitizedE2Entries.length > 0) {
        await tx.projectQualityE2Log.createMany({
          data: sanitizedE2Entries.map((entry) => ({
            projectId,
            submissionType: entry.submissionType,
            totalNumber: entry.totalNumber,
            submitted: entry.submitted,
            underReview: entry.underReview,
            approved: entry.approved,
            reviseAndResubmit: entry.reviseAndResubmit,
            sortOrder: entry.sortOrder,
          })),
        });
      }

      const [freshE1Entries, freshE2Entries] = await Promise.all([
        tx.projectQualityE1Log.findMany({
          where: { projectId },
          orderBy: orderByClause,
        }),
        tx.projectQualityE2Log.findMany({
          where: { projectId },
          orderBy: orderByClause,
        }),
      ]);

      return [freshE1Entries, freshE2Entries] as const;
    });

    return NextResponse.json({
      success: true,
      data: {
        e1Entries: nextE1Entries,
        e2Entries: nextE2Entries,
      },
    });
  } catch (error) {
    console.error('Error updating project quality data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project quality data' },
      { status: 500 }
    );
  }
}
