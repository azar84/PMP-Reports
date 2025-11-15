import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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

const checklistItemSchema = z.object({
  checkListItem: z.string().min(1, 'Check list item is required'),
  yesNo: z.enum(['Yes', 'No']).optional().nullable(),
  status: z.string().optional().nullable(),
  sortOrder: z.number().optional().default(0),
});

// GET - Fetch all checklist items for a project
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

    const checklistItems = await prisma.projectCommercialChecklistItem.findMany({
      where: { projectId },
      orderBy: [
        { sortOrder: 'asc' },
        { id: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, data: checklistItems });
  } catch (error) {
    console.error('Error fetching project commercial checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project commercial checklist' },
      { status: 500 }
    );
  }
}

// POST - Create new checklist item
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

    const body = await request.json();
    const validatedData = checklistItemSchema.parse(body);

    const checklistItem = await prisma.projectCommercialChecklistItem.create({
      data: {
        ...validatedData,
        projectId,
        sortOrder: validatedData.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: checklistItem });
  } catch (error) {
    console.error('Error creating commercial checklist item:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create commercial checklist item' },
      { status: 500 }
    );
  }
}

// PUT - Update multiple checklist items (bulk update)
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
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Items must be an array' },
        { status: 400 }
      );
    }

    // Use transaction to update all items atomically
    const result = await prisma.$transaction(async (tx) => {
      const updatedItems = [];
      
      for (const item of items) {
        const validatedData = checklistItemSchema.parse(item);
        
        const updateData = {
          ...validatedData,
          sortOrder: validatedData.sortOrder ?? 0,
        };

        const updatedItem = await tx.projectCommercialChecklistItem.update({
          where: { id: item.id },
          data: updateData,
        });
        
        updatedItems.push(updatedItem);
      }
      
      return updatedItems;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating commercial checklist items:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update commercial checklist items' },
      { status: 500 }
    );
  }
}

