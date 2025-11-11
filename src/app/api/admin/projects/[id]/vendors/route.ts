import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';
import { Prisma } from '@prisma/client';

const ALLOWED_RATINGS = ['VERY_GOOD', 'GOOD', 'POOR'] as const;
type AllowedRating = (typeof ALLOWED_RATINGS)[number];
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

function normalizeRating(value: unknown): AllowedRating | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return (ALLOWED_RATINGS as readonly string[]).includes(normalized)
    ? (normalized as AllowedRating)
    : null;
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

    const evaluations = await prisma.projectVendorEvaluation.findMany({
      where: { projectId },
      include: { supplier: true },
      orderBy: [{ createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: {
        evaluations,
      },
    });
  } catch (error) {
    console.error('Error fetching project vendor evaluations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project vendor feedback' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: RouteParams }) {
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
    const supplierId = Number.parseInt(body?.supplierId, 10);
    const rating = normalizeRating(body?.rating);
    const notes = sanitizeString(body?.notes);

    if (Number.isNaN(supplierId) || !rating) {
      return NextResponse.json(
        { success: false, error: 'Supplier and rating are required' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    const evaluation = await prisma.projectVendorEvaluation.create({
      data: {
        projectId,
        supplierId,
        rating,
        notes,
      },
      include: { supplier: true },
    });

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Vendor feedback already exists for this project' },
        { status: 409 }
      );
    }

    console.error('Error creating project vendor evaluation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save vendor feedback' },
      { status: 500 }
    );
  }
}
