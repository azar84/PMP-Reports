import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';

const changeOrderSchema = z.object({
  chRefNo: z.string().min(1, 'Change Order reference number is required').optional(),
  chDate: z.string().min(1, 'Change Order date is required').optional(),
  type: z.enum(['addition', 'omission']).optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  vatPercent: z.number().min(0).max(100).optional(),
  vatAmount: z.number().min(0).optional(),
  amountWithVat: z.number().min(0).optional(),
  description: z.string().optional().nullable(),
});

// PUT - Update a Change Order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; poId: string; changeOrderId: string }> }
) {
  try {
    const { changeOrderId } = await params;
    const changeOrderIdNum = parseInt(changeOrderId);
    
    if (isNaN(changeOrderIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Change Order ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = changeOrderSchema.parse(body);

    // Get existing change order to use current values if not provided
    const existingCO = await prisma.projectSubcontractorChangeOrder.findUnique({
      where: { id: changeOrderIdNum },
    });

    if (!existingCO) {
      return NextResponse.json(
        { success: false, error: 'Change Order not found' },
        { status: 404 }
      );
    }

    // Build update data - use provided values or recalculate
    const amount = validatedData.amount ?? Number(existingCO.amount);
    const vatPercent = validatedData.vatPercent ?? Number(existingCO.vatPercent ?? 5.0);
    const vatAmount = validatedData.vatAmount !== undefined 
      ? validatedData.vatAmount 
      : (validatedData.amount !== undefined ? (amount * (vatPercent / 100)) : Number(existingCO.vatAmount ?? 0));
    const amountWithVat = validatedData.amountWithVat ?? (amount + vatAmount);

    const updateData: any = {};
    if (validatedData.chRefNo !== undefined) updateData.chRefNo = validatedData.chRefNo;
    if (validatedData.chDate !== undefined) updateData.chDate = parseDateFromInput(validatedData.chDate) || undefined;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.amount !== undefined) updateData.amount = amount;
    if (validatedData.vatPercent !== undefined || validatedData.amount !== undefined) updateData.vatPercent = vatPercent;
    if (validatedData.vatAmount !== undefined || validatedData.amount !== undefined) {
      updateData.vatAmount = vatAmount;
      updateData.amountWithVat = amountWithVat;
    }
    if (validatedData.description !== undefined) updateData.description = validatedData.description;

    const changeOrder = await prisma.projectSubcontractorChangeOrder.update({
      where: { id: changeOrderIdNum },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: changeOrder });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating Change Order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update Change Order' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a Change Order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; poId: string; changeOrderId: string }> }
) {
  try {
    const { changeOrderId } = await params;
    const changeOrderIdNum = parseInt(changeOrderId);
    
    if (isNaN(changeOrderIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Change Order ID' },
        { status: 400 }
      );
    }

    // Check if the change order is used in any invoices
    const invoiceChangeOrders = await prisma.projectSubcontractorInvoiceChangeOrder.findMany({
      where: { changeOrderId: changeOrderIdNum },
    });

    if (invoiceChangeOrders.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete Change Order that is linked to invoices' },
        { status: 400 }
      );
    }

    await prisma.projectSubcontractorChangeOrder.delete({
      where: { id: changeOrderIdNum },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting Change Order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete Change Order' },
      { status: 500 }
    );
  }
}

