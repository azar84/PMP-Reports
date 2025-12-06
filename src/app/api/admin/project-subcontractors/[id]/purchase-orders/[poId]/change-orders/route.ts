import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';

const changeOrderSchema = z.object({
  chRefNo: z.string().min(1, 'Change Order reference number is required'),
  chDate: z.string().min(1, 'Change Order date is required'),
  type: z.enum(['addition', 'omission'], {
    errorMap: () => ({ message: 'Type must be either "addition" or "omission"' }),
  }),
  amount: z.number().positive('Amount must be positive'),
  vatPercent: z.number().min(0).max(100).optional().default(5.0),
  vatAmount: z.number().min(0).optional().default(0),
  amountWithVat: z.number().min(0).optional().default(0),
  description: z.string().optional().nullable(),
});

// GET - Fetch all Change Orders for a purchase order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; poId: string }> }
) {
  try {
    const { poId } = await params;
    const purchaseOrderId = parseInt(poId);
    
    if (isNaN(purchaseOrderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase order ID' },
        { status: 400 }
      );
    }

    const changeOrders = await prisma.projectSubcontractorChangeOrder.findMany({
      where: { purchaseOrderId },
      orderBy: { chDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: changeOrders });
  } catch (error) {
    console.error('Error fetching Change Orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Change Orders' },
      { status: 500 }
    );
  }
}

// POST - Create a new Change Order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; poId: string }> }
) {
  try {
    const { poId } = await params;
    const purchaseOrderId = parseInt(poId);
    
    if (isNaN(purchaseOrderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase order ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = changeOrderSchema.parse(body);

    // Get the purchase order to get projectId and projectSubcontractorId
    const purchaseOrder = await prisma.projectSubcontractorPurchaseOrder.findUnique({
      where: { id: purchaseOrderId },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { success: false, error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Calculate VAT and amount with VAT if not provided
    const vatPercent = validatedData.vatPercent || 5.0;
    const vatAmount = validatedData.vatAmount ?? (validatedData.amount * (vatPercent / 100));
    const amountWithVat = validatedData.amountWithVat ?? (validatedData.amount + vatAmount);

    // Store amount as positive, we'll handle sign based on type
    const changeOrder = await prisma.projectSubcontractorChangeOrder.create({
      data: {
        projectId: purchaseOrder.projectId,
        projectSubcontractorId: purchaseOrder.projectSubcontractorId,
        purchaseOrderId,
        chRefNo: validatedData.chRefNo,
        chDate: parseDateFromInput(validatedData.chDate)!,
        type: validatedData.type,
        amount: validatedData.amount, // Store as positive, type indicates addition/omission
        vatPercent: vatPercent,
        vatAmount: vatAmount,
        amountWithVat: amountWithVat,
        description: validatedData.description || null,
      },
    });

    return NextResponse.json({ success: true, data: changeOrder });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating Change Order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Change Order' },
      { status: 500 }
    );
  }
}

