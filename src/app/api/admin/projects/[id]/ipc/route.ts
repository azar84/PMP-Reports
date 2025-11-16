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
    console.warn('Invalid token in project IPC request');
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

function parseOptionalDecimal(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric < 0 ? 0 : numeric;
}

function parseOptionalInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const rounded = Math.round(numeric);
  return rounded < 0 ? 0 : rounded;
}

function parseOptionalDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

function normalizeString(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string') return value.trim();
  return fallback;
}

type SanitizedIPCEntry = {
  paymentType: string | null;
  invoiceNumber: string;
  month: string | null;
  grossValueSubmitted: number | null;
  dateSubmitted: Date | null;
  grossValueCertified: number | null;
  certifiedDate: Date | null;
  paymentDueDate: Date | null;
  advancePaymentRecovery: number | null;
  retention: number | null;
  contraCharges: number | null;
  netCertifiedPayable: number | null;
  vat5Percent: number | null;
  netPayable: number | null;
  paymentStatus: string | null;
  receivedPayment: number | null;
  paymentReceivedDate: Date | null;
  inProcess: number | null;
  dueDays: number | null;
  overDueAmount: number | null;
  remarks: string | null;
  sortOrder: number;
};

function sanitizeIPCEntries(rawEntries: any[]): SanitizedIPCEntry[] {
  return rawEntries
    .map((entry: any, index: number) => {
      const invoiceNumber = normalizeString(entry?.invoiceNumber);
      if (!invoiceNumber) return null; // Skip rows with empty invoice numbers

      const paymentType = entry?.paymentType ? normalizeString(entry.paymentType) : null;
      const validPaymentTypes = ['Adv', 'Progress', 'Retention Release'];
      const normalizedPaymentType = paymentType && validPaymentTypes.includes(paymentType) ? paymentType : null;

      return {
        paymentType: normalizedPaymentType,
        invoiceNumber,
        month: entry?.month ? normalizeString(entry.month) : null,
        grossValueSubmitted: parseOptionalDecimal(entry?.grossValueSubmitted),
        dateSubmitted: parseOptionalDate(entry?.dateSubmitted),
        grossValueCertified: parseOptionalDecimal(entry?.grossValueCertified),
        certifiedDate: parseOptionalDate(entry?.certifiedDate),
        paymentDueDate: parseOptionalDate(entry?.paymentDueDate),
        advancePaymentRecovery: parseOptionalDecimal(entry?.advancePaymentRecovery),
        retention: parseOptionalDecimal(entry?.retention),
        contraCharges: parseOptionalDecimal(entry?.contraCharges),
        netCertifiedPayable: parseOptionalDecimal(entry?.netCertifiedPayable),
        vat5Percent: parseOptionalDecimal(entry?.vat5Percent),
        netPayable: parseOptionalDecimal(entry?.netPayable),
        paymentStatus: entry?.paymentStatus ? normalizeString(entry.paymentStatus) : null,
        receivedPayment: parseOptionalDecimal(entry?.receivedPayment),
        paymentReceivedDate: parseOptionalDate(entry?.paymentReceivedDate),
        inProcess: parseOptionalDecimal(entry?.inProcess),
        dueDays: parseOptionalInteger(entry?.dueDays),
        overDueAmount: parseOptionalDecimal(entry?.overDueAmount),
        remarks: entry?.remarks ? normalizeString(entry.remarks) : null,
        sortOrder: typeof entry?.sortOrder === 'number' ? entry.sortOrder : index,
      };
    })
    .filter(Boolean) as SanitizedIPCEntry[];
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

    const entries = await prisma.projectIPC.findMany({
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
    console.error('Error fetching project IPC data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project IPC data' },
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

    const sanitizedEntries = sanitizeIPCEntries(rawEntries);

    const nextEntries = await prisma.$transaction(async (tx) => {
      await tx.projectIPC.deleteMany({ where: { projectId } });

      if (sanitizedEntries.length > 0) {
        await tx.projectIPC.createMany({
          data: sanitizedEntries.map((entry) => ({
            projectId,
            paymentType: entry.paymentType,
            invoiceNumber: entry.invoiceNumber,
            month: entry.month,
            grossValueSubmitted: entry.grossValueSubmitted,
            dateSubmitted: entry.dateSubmitted,
            grossValueCertified: entry.grossValueCertified,
            certifiedDate: entry.certifiedDate,
            paymentDueDate: entry.paymentDueDate,
            advancePaymentRecovery: entry.advancePaymentRecovery,
            retention: entry.retention,
            contraCharges: entry.contraCharges,
            netCertifiedPayable: entry.netCertifiedPayable,
            vat5Percent: entry.vat5Percent,
            netPayable: entry.netPayable,
            paymentStatus: entry.paymentStatus,
            receivedPayment: entry.receivedPayment,
            paymentReceivedDate: entry.paymentReceivedDate,
            inProcess: entry.inProcess,
            dueDays: entry.dueDays,
            overDueAmount: entry.overDueAmount,
            remarks: entry.remarks,
            sortOrder: entry.sortOrder,
          })),
        });
      }

      const freshEntries = await tx.projectIPC.findMany({
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
    console.error('Error updating project IPC data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project IPC data' },
      { status: 500 }
    );
  }
}

