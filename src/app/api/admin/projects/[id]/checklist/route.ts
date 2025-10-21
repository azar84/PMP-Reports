import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

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

// GET - Fetch all checklist items for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const checklistItems = await prisma.projectChecklistItem.findMany({
      where: { projectId },
      orderBy: [
        { createdAt: 'asc' }
      ],
    });

    return NextResponse.json({ success: true, data: checklistItems });
  } catch (error) {
    console.error('Error fetching project checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project checklist' },
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
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = checklistItemSchema.parse(body);

    // Convert date strings to DateTime objects if provided
    const checklistData = {
      ...validatedData,
      projectId,
      itemNumber: validatedData.itemNumber || '', // Add itemNumber field
      plannedDate: validatedData.plannedDate ? new Date(validatedData.plannedDate) : null,
      actualDate: validatedData.actualDate ? new Date(validatedData.actualDate) : null,
    };

    const checklistItem = await prisma.projectChecklistItem.create({
      data: checklistData,
    });

    return NextResponse.json({ success: true, data: checklistItem });
  } catch (error) {
    console.error('Error creating checklist item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checklist item' },
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
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
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
          plannedDate: validatedData.plannedDate ? new Date(validatedData.plannedDate) : null,
          actualDate: validatedData.actualDate ? new Date(validatedData.actualDate) : null,
        };

        const updatedItem = await tx.projectChecklistItem.update({
          where: { id: item.id },
          data: updateData,
        });
        
        updatedItems.push(updatedItem);
      }
      
      return updatedItems;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating checklist items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update checklist items' },
      { status: 500 }
    );
  }
}
