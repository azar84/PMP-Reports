import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';

const DEFAULT_CHECKLIST_ITEMS = [
  'QS Vs Tender',
  'Tender Drawing VS IFC',
  'VO',
  'Budget Sign off',
  'Budget Breakdown (Categories)',
  'Cash Flow',
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
    console.warn('Invalid token in project commercial checklist initialize request');
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

// POST - Initialize checklist with default items
export async function POST(
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

    // Check if checklist items already exist
    const existingItems = await prisma.projectCommercialChecklistItem.findMany({
      where: { projectId },
    });

    if (existingItems.length > 0) {
      return NextResponse.json({
        success: true,
        data: existingItems,
        message: 'Checklist already initialized',
      });
    }

    // Create default checklist items
    const result = await prisma.$transaction(async (tx) => {
      const items = await Promise.all(
        DEFAULT_CHECKLIST_ITEMS.map((item, index) =>
          tx.projectCommercialChecklistItem.create({
            data: {
              projectId,
              checkListItem: item,
              yesNo: null,
              status: null,
              sortOrder: index,
            },
          })
        )
      );
      return items;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error initializing commercial checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize commercial checklist' },
      { status: 500 }
    );
  }
}

