import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';

const checklistItemSchema = z.object({
  checkListItem: z.string().min(1, 'Check list item is required'),
  yesNo: z.enum(['Yes', 'No']).optional().nullable(),
  status: z.string().optional().nullable(),
  sortOrder: z.number().optional().default(0),
});

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
    console.warn('Invalid token in project commercial checklist request');
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

// GET - Fetch single checklist item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const projectId = parseInt(id, 10);
    const checklistItemId = parseInt(itemId, 10);

    if (isNaN(projectId) || isNaN(checklistItemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID or checklist item ID' },
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

    const checklistItem = await prisma.projectCommercialChecklistItem.findFirst({
      where: {
        id: checklistItemId,
        projectId: projectId,
      },
    });

    if (!checklistItem) {
      return NextResponse.json(
        { success: false, error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: checklistItem });
  } catch (error) {
    console.error('Error fetching commercial checklist item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commercial checklist item' },
      { status: 500 }
    );
  }
}

// PUT - Update single checklist item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const projectId = parseInt(id, 10);
    const checklistItemId = parseInt(itemId, 10);

    if (isNaN(projectId) || isNaN(checklistItemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID or checklist item ID' },
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
    const validatedData = checklistItemSchema.parse(body);

    const checklistItem = await prisma.projectCommercialChecklistItem.update({
      where: {
        id: checklistItemId,
      },
      data: validatedData,
    });

    return NextResponse.json({ success: true, data: checklistItem });
  } catch (error) {
    console.error('Error updating commercial checklist item:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update commercial checklist item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete single checklist item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const projectId = parseInt(id, 10);
    const checklistItemId = parseInt(itemId, 10);

    if (isNaN(projectId) || isNaN(checklistItemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID or checklist item ID' },
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

    await prisma.projectCommercialChecklistItem.delete({
      where: {
        id: checklistItemId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting commercial checklist item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete commercial checklist item' },
      { status: 500 }
    );
  }
}

