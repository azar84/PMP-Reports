import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';

const purchaseOrderUpdateSchema = z.object({
  lpoNumber: z.string().min(1, 'LPO Number is required').optional(),
  lpoDate: z.string().min(1, 'LPO Date is required').optional(),
  lpoValue: z.number().positive('LPO Value must be positive').optional(),
  vatPercent: z.number().min(0).max(100).optional(),
  notes: z.string().optional().nullable(),
});

// PUT - Update a purchase order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; poId: string }> }
) {
  try {
    const { id, poId } = await params;
    const projectSubcontractorId = parseInt(id);
    const purchaseOrderId = parseInt(poId);

    if (isNaN(projectSubcontractorId) || isNaN(purchaseOrderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid IDs' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = purchaseOrderUpdateSchema.parse(body);

    const updateData: any = {};

    if (validatedData.lpoNumber !== undefined) {
      updateData.lpoNumber = validatedData.lpoNumber;
    }
    if (validatedData.lpoDate !== undefined) {
      updateData.lpoDate = parseDateFromInput(validatedData.lpoDate);
    }
    if (validatedData.lpoValue !== undefined) {
      updateData.lpoValue = validatedData.lpoValue;
    }
    if (validatedData.vatPercent !== undefined) {
      updateData.vatPercent = validatedData.vatPercent;
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes || null;
    }

    // Recalculate lpoValueWithVat if lpoValue or vatPercent changed
    if (validatedData.lpoValue !== undefined || validatedData.vatPercent !== undefined) {
      const existing = await prisma.projectSubcontractorPurchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        select: { lpoValue: true, vatPercent: true },
      });

      const lpoValue = validatedData.lpoValue ?? existing?.lpoValue ?? 0;
      const vatPercent = validatedData.vatPercent ?? existing?.vatPercent ?? 5.0;
      updateData.lpoValueWithVat = Number(lpoValue) * (1 + Number(vatPercent) / 100);
    }

    const purchaseOrder = await prisma.projectSubcontractorPurchaseOrder.update({
      where: { id: purchaseOrderId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: purchaseOrder });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating purchase order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update purchase order' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a purchase order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; poId: string }> }
) {
  try {
    const { id, poId } = await params;
    const purchaseOrderId = parseInt(poId);

    if (isNaN(purchaseOrderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase order ID' },
        { status: 400 }
      );
    }

    await prisma.projectSubcontractorPurchaseOrder.delete({
      where: { id: purchaseOrderId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting purchase order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete purchase order' },
      { status: 500 }
    );
  }
}

