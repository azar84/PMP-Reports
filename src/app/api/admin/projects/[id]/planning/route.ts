import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';
import { parseDateFromInput } from '@/lib/dateUtils';

const CONTROL_MILESTONE_STATUSES = new Set(['Pending', 'Ongoing', 'Completed']);

function normalizeStatusInput(status: string | null | undefined): string {
  if (!status) return 'Pending';
  const trimmed = status.trim();
  if (!trimmed) return 'Pending';
  const lower = trimmed.toLowerCase();
  const titleCased = lower.charAt(0).toUpperCase() + lower.slice(1);
  return CONTROL_MILESTONE_STATUSES.has(titleCased) ? titleCased : 'Pending';
}

const milestoneOrderBy = [
  { sortOrder: 'asc' as const },
  { startDate: 'asc' as const },
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
    console.warn('Invalid token in project planning request');
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
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

    const planning = await prisma.projectPlanning.findUnique({
      where: { projectId },
      include: {
        controlMilestones: {
          orderBy: milestoneOrderBy,
        },
      },
    });

    const controlMilestones =
      planning?.controlMilestones ||
      (await prisma.projectControlMilestone.findMany({
        where: { projectId },
        orderBy: milestoneOrderBy,
      }));

    return NextResponse.json({
      success: true,
      data: {
        planning,
        controlMilestones,
      },
    });
  } catch (error) {
    console.error('Error fetching project planning data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project planning data' },
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

    if (isNaN(projectId)) {
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

    const parsedPlanned = body.plannedProgress !== undefined && body.plannedProgress !== null && body.plannedProgress !== ''
      ? Number(body.plannedProgress)
      : undefined;
    const parsedActual = body.actualProgress !== undefined && body.actualProgress !== null && body.actualProgress !== ''
      ? Number(body.actualProgress)
      : undefined;
    const parsedEotDays = body.eotDays !== undefined && body.eotDays !== null && body.eotDays !== ''
      ? Number(body.eotDays)
      : undefined;

    const plannedDecimal =
      parsedPlanned !== undefined && !Number.isNaN(parsedPlanned)
        ? new Prisma.Decimal(parsedPlanned)
        : null;
    const actualDecimal =
      parsedActual !== undefined && !Number.isNaN(parsedActual)
        ? new Prisma.Decimal(parsedActual)
        : null;

    let varianceDecimal: Prisma.Decimal | null = null;
    if (plannedDecimal && actualDecimal) {
      const varianceValue = actualDecimal.toNumber() - plannedDecimal.toNumber();
      if (!Number.isNaN(varianceValue)) {
        varianceDecimal = new Prisma.Decimal(varianceValue);
      }
    }

    const eotDaysValue =
      parsedEotDays !== undefined && !Number.isNaN(parsedEotDays)
        ? Math.round(parsedEotDays)
        : null;

    const rawMilestones = Array.isArray(body.controlMilestones)
      ? body.controlMilestones
      : [];

    const sanitizedMilestones = rawMilestones
      .map((milestone: any, index: number) => {
        const name = typeof milestone?.name === 'string' ? milestone.name.trim() : '';
        if (!name) return null;

        const sortOrder =
          typeof milestone?.sortOrder === 'number' && !Number.isNaN(milestone.sortOrder)
            ? milestone.sortOrder
            : index;

        return {
          name,
          startDate: parseDateFromInput(milestone?.startDate) ?? null,
          endDate: parseDateFromInput(milestone?.endDate) ?? null,
        actualStartDate: parseDateFromInput(milestone?.actualStartDate) ?? null,
        actualEndDate: parseDateFromInput(milestone?.actualEndDate) ?? null,
        status: normalizeStatusInput(milestone?.status),
          sortOrder,
        };
      })
      .filter(Boolean) as Array<{
        name: string;
        startDate: Date | null;
        endDate: Date | null;
      actualStartDate: Date | null;
      actualEndDate: Date | null;
      status: string;
        sortOrder: number;
      }>;

    const result = await prisma.$transaction(async (tx) => {
      const planningRecord = await tx.projectPlanning.upsert({
        where: { projectId },
        update: {
          targetProgramStart: parseDateFromInput(body.targetProgramStart) ?? null,
          targetProgramEnd: parseDateFromInput(body.targetProgramEnd) ?? null,
          plannedProgress: plannedDecimal,
          actualProgress: actualDecimal,
          variance: varianceDecimal,
          eotStart: parseDateFromInput(body.eotStart) ?? null,
          eotEnd: parseDateFromInput(body.eotEnd) ?? null,
          eotDays: eotDaysValue,
        },
        create: {
          projectId,
          targetProgramStart: parseDateFromInput(body.targetProgramStart) ?? null,
          targetProgramEnd: parseDateFromInput(body.targetProgramEnd) ?? null,
          plannedProgress: plannedDecimal,
          actualProgress: actualDecimal,
          variance: varianceDecimal,
          eotStart: parseDateFromInput(body.eotStart) ?? null,
          eotEnd: parseDateFromInput(body.eotEnd) ?? null,
          eotDays: eotDaysValue,
        },
      });

      await tx.projectControlMilestone.deleteMany({
        where: { projectId },
      });

      if (sanitizedMilestones.length > 0) {
        await tx.projectControlMilestone.createMany({
          data: sanitizedMilestones.map((milestone, index) => ({
            projectId,
            planningId: planningRecord.id,
            name: milestone.name,
            startDate: milestone.startDate,
            endDate: milestone.endDate,
            actualStartDate: milestone.actualStartDate,
            actualEndDate: milestone.actualEndDate,
            status: CONTROL_MILESTONE_STATUSES.has(milestone.status) ? milestone.status : 'Pending',
            sortOrder: milestone.sortOrder ?? index,
          })),
        });
      }

      return tx.projectPlanning.findUnique({
        where: { projectId },
        include: {
          controlMilestones: {
            orderBy: milestoneOrderBy,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        planning: result,
        controlMilestones: result?.controlMilestones ?? [],
      },
    });
  } catch (error) {
    console.error('Error updating project planning data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project planning data' },
      { status: 500 }
    );
  }
}

