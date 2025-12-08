import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';

const checklistItemSchema = z.object({
  itemNumber: z.string().optional().or(z.literal('')),
  phase: z.string().min(1, 'Phase description is required'),
  plannedDate: z.string().optional().or(z.null()),
  actualDate: z.string().optional().or(z.null()),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled']).optional().or(z.null()),
  notes: z.string().optional().or(z.null()),
  isSubItem: z.boolean().default(false),
  parentItemId: z.number().optional().or(z.null()),
});

// GET - Fetch single checklist item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const projectId = parseInt(id);
    const checklistItemId = parseInt(itemId);
    
    if (isNaN(projectId) || isNaN(checklistItemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID or checklist item ID' },
        { status: 400 }
      );
    }

    const checklistItem = await prisma.projectChecklistItem.findFirst({
      where: { 
        id: checklistItemId,
        projectId: projectId 
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
    console.error('Error fetching checklist item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch checklist item' },
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
    const projectId = parseInt(id);
    const checklistItemId = parseInt(itemId);
    
    if (isNaN(projectId) || isNaN(checklistItemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID or checklist item ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = checklistItemSchema.parse(body);

    // Convert date strings to DateTime objects if provided
    const updateData = {
      ...validatedData,
      plannedDate: parseDateFromInput(validatedData.plannedDate),
      actualDate: parseDateFromInput(validatedData.actualDate),
    };

    const checklistItem = await prisma.projectChecklistItem.update({
      where: { 
        id: checklistItemId,
        projectId: projectId 
      },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: checklistItem });
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update checklist item' },
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
    const projectId = parseInt(id);
    const checklistItemId = parseInt(itemId);
    
    if (isNaN(projectId) || isNaN(checklistItemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID or checklist item ID' },
        { status: 400 }
      );
    }

    await prisma.projectChecklistItem.delete({
      where: { 
        id: checklistItemId,
        projectId: projectId 
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete checklist item' },
      { status: 500 }
    );
  }
}
