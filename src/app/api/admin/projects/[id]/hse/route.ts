import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';
import { parseDateFromInput } from '@/lib/dateUtils';

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
    // ignore invalid token here and fall through to unauthorized response
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

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsedInput = parseDateFromInput(trimmed);
    if (parsedInput) {
      return parsedInput;
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
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

    const [hseItems, nocEntries] = await Promise.all([
      prisma.projectHseChecklistItem.findMany({
        where: { projectId },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      }),
      prisma.projectNocTrackerEntry.findMany({
        where: { projectId },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        hseItems,
        nocEntries,
      },
    });
  } catch (error) {
    console.error('Error fetching project HSE/NOC data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch HSE and NOC tracker data' },
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
    const rawHseItems = Array.isArray(body?.hseItems) ? body.hseItems : [];
    const rawNocEntries = Array.isArray(body?.nocEntries) ? body.nocEntries : [];

    const sanitizedHseItems = rawHseItems
      .map((item: any, index: number) => {
        const name = sanitizeString(item?.item) ?? sanitizeString(item?.title);
        const status = sanitizeString(item?.status);
        const notes = sanitizeString(item?.notes);
        const plannedDate = parseDateValue(item?.plannedDate);
        const actualDate = parseDateValue(item?.actualDate);

        if (!name && !plannedDate && !actualDate && !status && !notes) {
          return null;
        }

        return {
          projectId,
          item: name ?? 'Checklist Item',
          plannedDate,
          actualDate,
          status,
          notes,
          sortOrder: typeof item?.sortOrder === 'number' ? item.sortOrder : index,
        };
      })
      .filter(Boolean) as Array<{
        projectId: number;
        item: string;
        plannedDate: Date | null;
        actualDate: Date | null;
        status: string | null;
        notes: string | null;
        sortOrder: number;
      }>;

    const sanitizedNocEntries = rawNocEntries
      .map((entry: any, index: number) => {
        const nocNumber = sanitizeString(entry?.nocNumber);
        const permitType = sanitizeString(entry?.permitType ?? entry?.nocType);
        const status = sanitizeString(entry?.status);
        const remarks = sanitizeString(entry?.remarks);
        const plannedSubmissionDate = parseDateValue(
          entry?.plannedSubmissionDate ?? entry?.plannedSubmission
        );
        const actualSubmissionDate = parseDateValue(
          entry?.actualSubmissionDate ?? entry?.actualSubmission
        );
        const expiryDate = parseDateValue(entry?.expiryDate);

        if (
          !nocNumber &&
          !permitType &&
          !status &&
          !remarks &&
          !plannedSubmissionDate &&
          !actualSubmissionDate &&
          !expiryDate
        ) {
          return null;
        }

        return {
          projectId,
          nocNumber,
          permitType,
          status,
          remarks,
          plannedSubmissionDate,
          actualSubmissionDate,
          expiryDate,
          sortOrder: typeof entry?.sortOrder === 'number' ? entry.sortOrder : index,
        };
      })
      .filter(Boolean) as Array<{
        projectId: number;
        nocNumber: string | null;
        permitType: string | null;
        status: string | null;
        remarks: string | null;
        plannedSubmissionDate: Date | null;
        actualSubmissionDate: Date | null;
        expiryDate: Date | null;
        sortOrder: number;
      }>;

    const [nextHseItems, nextNocEntries] = await prisma.$transaction(async (tx) => {
      await tx.projectHseChecklistItem.deleteMany({ where: { projectId } });
      await tx.projectNocTrackerEntry.deleteMany({ where: { projectId } });

      if (sanitizedHseItems.length > 0) {
        await tx.projectHseChecklistItem.createMany({
          data: sanitizedHseItems.map((item) => ({
            projectId: item.projectId,
            item: item.item,
            plannedDate: item.plannedDate,
            actualDate: item.actualDate,
            status: item.status,
            notes: item.notes,
            sortOrder: item.sortOrder,
          })),
        });
      }

      if (sanitizedNocEntries.length > 0) {
        await tx.projectNocTrackerEntry.createMany({
          data: sanitizedNocEntries.map((entry) => ({
            projectId: entry.projectId,
            nocNumber: entry.nocNumber,
            permitType: entry.permitType,
            plannedSubmissionDate: entry.plannedSubmissionDate,
            actualSubmissionDate: entry.actualSubmissionDate,
            status: entry.status,
            expiryDate: entry.expiryDate,
            remarks: entry.remarks,
            sortOrder: entry.sortOrder,
          })),
        });
      }

      const [freshHseItems, freshNocEntries] = await Promise.all([
        tx.projectHseChecklistItem.findMany({
          where: { projectId },
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        }),
        tx.projectNocTrackerEntry.findMany({
          where: { projectId },
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        }),
      ]);

      return [freshHseItems, freshNocEntries] as const;
    });

    return NextResponse.json({
      success: true,
      data: {
        hseItems: nextHseItems,
        nocEntries: nextNocEntries,
      },
    });
  } catch (error) {
    console.error('Error updating project HSE/NOC data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update HSE and NOC tracker data' },
      { status: 500 }
    );
  }
}

