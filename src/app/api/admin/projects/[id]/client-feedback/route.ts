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

function sanitizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitizeString(item))
    .filter((item): item is string => item !== null);
}

const VALID_RATINGS = ['Excellent', 'Very Good', 'Good', 'Average', 'Below Expectation', 'Poor'] as const;

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

    const feedback = await prisma.projectClientFeedback.findUnique({
      where: { projectId },
    });

    return NextResponse.json({
      success: true,
      data: {
        feedback: feedback || null,
      },
    });
  } catch (error) {
    console.error('Error fetching project client feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project client feedback' },
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
    const rating = sanitizeString(body?.rating);
    const positivePoints = sanitizeArray(body?.positivePoints);
    const negativePoints = sanitizeArray(body?.negativePoints);

    // Validate rating if provided
    const validRating = rating && VALID_RATINGS.includes(rating as any) ? rating : null;

    const feedback = await prisma.projectClientFeedback.upsert({
      where: { projectId },
      update: {
        rating: validRating,
        positivePoints: positivePoints.length > 0 ? positivePoints : null,
        negativePoints: negativePoints.length > 0 ? negativePoints : null,
      },
      create: {
        projectId,
        rating: validRating,
        positivePoints: positivePoints.length > 0 ? positivePoints : null,
        negativePoints: negativePoints.length > 0 ? negativePoints : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        feedback,
      },
    });
  } catch (error) {
    console.error('Error updating project client feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project client feedback' },
      { status: 500 }
    );
  }
}

