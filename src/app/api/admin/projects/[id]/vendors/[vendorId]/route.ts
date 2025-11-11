import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';
import { Prisma } from '@prisma/client';

const ALLOWED_RATINGS = ['VERY_GOOD', 'GOOD', 'POOR'] as const;
type AllowedRating = (typeof ALLOWED_RATINGS)[number];
type RouteParams = Promise<{ id: string; vendorId: string }>;

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

export async function PUT(request: NextRequest, { params }: { params: RouteParams }) {
  try {
    const { id, vendorId } = await params;
    const projectId = Number.parseInt(id, 10);
    const evaluationId = Number.parseInt(vendorId, 10);

    if (Number.isNaN(projectId) || Number.isNaN(evaluationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid identifiers' },
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

    const existing = await prisma.projectVendorEvaluation.findFirst({
      where: { id: evaluationId, projectId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Vendor feedback not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const supplierProvided = Object.prototype.hasOwnProperty.call(body ?? {}, 'supplierId');
    const ratingProvided = Object.prototype.hasOwnProperty.call(body ?? {}, 'rating');
    const notesProvided = Object.prototype.hasOwnProperty.call(body ?? {}, 'notes');

    const updateData: {
      supplierId?: number;
      rating?: AllowedRating;
      notes?: string | null;
    } = {};

    if (supplierProvided) {
      const maybeSupplierId = body?.supplierId;
      const supplierId =
        typeof maybeSupplierId === 'number'
          ? maybeSupplierId
          : Number.parseInt(maybeSupplierId, 10);

      if (Number.isNaN(supplierId) || typeof supplierId !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Invalid supplier selection' },
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
      updateData.supplierId = supplierId;
    }

    if (ratingProvided) {
      const rating = normalizeRating(body?.rating);
      if (!rating) {
        return NextResponse.json(
          { success: false, error: 'Invalid rating selection' },
          { status: 400 }
        );
      }
      updateData.rating = rating;
    }

    if (notesProvided) {
      updateData.notes = sanitizeString(body?.notes);
    }

    if (!supplierProvided && !ratingProvided && !notesProvided) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    const updated = await prisma.projectVendorEvaluation.update({
      where: { id: evaluationId },
      data: updateData,
      include: { supplier: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Vendor feedback already exists for this project' },
        { status: 409 }
      );
    }

    console.error('Error updating project vendor evaluation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor feedback' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: RouteParams }) {
  try {
    const { id, vendorId } = await params;
    const projectId = Number.parseInt(id, 10);
    const evaluationId = Number.parseInt(vendorId, 10);

    if (Number.isNaN(projectId) || Number.isNaN(evaluationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid identifiers' },
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

    const existing = await prisma.projectVendorEvaluation.findFirst({
      where: { id: evaluationId, projectId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Vendor feedback not found' },
        { status: 404 }
      );
    }

    await prisma.projectVendorEvaluation.delete({ where: { id: evaluationId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project vendor evaluation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vendor feedback' },
      { status: 500 }
    );
  }
}
