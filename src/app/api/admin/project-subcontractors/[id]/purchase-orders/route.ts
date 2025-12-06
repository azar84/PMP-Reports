import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';

const purchaseOrderSchema = z.object({
  lpoNumber: z.string().min(1, 'LPO Number is required'),
  lpoDate: z.string().min(1, 'LPO Date is required'),
  lpoValue: z.number().positive('LPO Value must be positive'),
  vatPercent: z.number().min(0).max(100).default(5.0),
  notes: z.string().optional().nullable(),
});

// GET - Fetch all purchase orders for a project subcontractor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSubcontractorId = parseInt(id);

    if (isNaN(projectSubcontractorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project subcontractor ID' },
        { status: 400 }
      );
    }

    const purchaseOrders = await prisma.projectSubcontractorPurchaseOrder.findMany({
      where: { projectSubcontractorId },
      include: {
        changeOrders: {
          orderBy: {
            chDate: 'desc',
          },
        },
      },
      orderBy: {
        lpoDate: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: purchaseOrders });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase orders' },
      { status: 500 }
    );
  }
}

// POST - Create a new purchase order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSubcontractorId = parseInt(id);

    if (isNaN(projectSubcontractorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project subcontractor ID' },
        { status: 400 }
      );
    }

    // Get project subcontractor to get projectId
    const projectSubcontractor = await prisma.projectSubcontractor.findUnique({
      where: { id: projectSubcontractorId },
      select: { projectId: true },
    });

    if (!projectSubcontractor) {
      return NextResponse.json(
        { success: false, error: 'Project subcontractor not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = purchaseOrderSchema.parse(body);

    const lpoDate = parseDateFromInput(validatedData.lpoDate);
    const vatPercent = validatedData.vatPercent || 5.0;
    const lpoValueWithVat = validatedData.lpoValue * (1 + vatPercent / 100);

    const purchaseOrder = await prisma.projectSubcontractorPurchaseOrder.create({
      data: {
        projectId: projectSubcontractor.projectId,
        projectSubcontractorId,
        lpoNumber: validatedData.lpoNumber,
         lpoDate: lpoDate!,
        lpoValue: validatedData.lpoValue,
        vatPercent,
        lpoValueWithVat,
        notes: validatedData.notes || null,
      },
    });

    return NextResponse.json({ success: true, data: purchaseOrder });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}

