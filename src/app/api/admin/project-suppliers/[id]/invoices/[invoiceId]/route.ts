import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';
import { updateInvoiceStatus } from '@/lib/invoiceStatus';

// Helper function to get VAT percentage from site settings
async function getVatPercent(): Promise<number> {
  const siteSettings = await prisma.siteSettings.findFirst();
  return siteSettings?.vatPercent ? Number(siteSettings.vatPercent) : 5; // Default to 5%
}

// PUT - Update an invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invoiceId: string }> }
) {
  try {
    const { id, invoiceId } = await params;
    const projectSupplierId = parseInt(id);
    const invoiceIdNum = parseInt(invoiceId);
    
    if (isNaN(projectSupplierId) || isNaN(invoiceIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project supplier or invoice ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { invoiceNumber, invoiceDate, dueDate, purchaseOrderId, grnIds, paymentType, downPayment, invoiceAmount, vatAmount, downPaymentRecovery, totalAmount } = body;

    // Get the existing invoice to get projectId
    const existingInvoice = await prisma.projectInvoice.findUnique({
      where: { id: invoiceIdNum },
      select: { projectId: true, paymentType: true },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!invoiceNumber || !invoiceDate) {
      return NextResponse.json(
        { success: false, error: 'Invoice number and date are required' },
        { status: 400 }
      );
    }

    if (!paymentType || !['Down Payment', 'Progress Payment'].includes(paymentType)) {
      return NextResponse.json(
        { success: false, error: 'Payment type must be "Down Payment" or "Progress Payment"' },
        { status: 400 }
      );
    }

    // Validate down payment
    if (paymentType === 'Down Payment') {
      if (!downPayment || parseFloat(downPayment) <= 0) {
        return NextResponse.json(
          { success: false, error: 'Down payment amount is required for Down Payment type' },
          { status: 400 }
        );
      }

      if (!purchaseOrderId) {
        return NextResponse.json(
          { success: false, error: 'Purchase Order is required for Down Payment type' },
          { status: 400 }
        );
      }

      // Check if a down payment already exists for this project (excluding current invoice)
      const existingDownPayment = await prisma.projectInvoice.findFirst({
        where: {
          projectId: existingInvoice.projectId,
          paymentType: 'Down Payment',
          id: { not: invoiceIdNum }, // Exclude current invoice
        },
      });

      if (existingDownPayment) {
        return NextResponse.json(
          { success: false, error: 'A down payment already exists for this project. Only one down payment is allowed per project.' },
          { status: 400 }
        );
      }

      // Verify the PO belongs to this supplier
      const po = await prisma.projectPurchaseOrder.findFirst({
        where: {
          id: purchaseOrderId,
          projectSupplierId,
        },
      });

      if (!po) {
        return NextResponse.json(
          { success: false, error: 'Purchase Order not found or does not belong to this supplier' },
          { status: 400 }
        );
      }
    } else {
      // Progress Payment - down payment should be null, need GRNs
      if (downPayment) {
        return NextResponse.json(
          { success: false, error: 'Down payment amount should not be provided for Progress Payment type' },
          { status: 400 }
        );
      }

      if (!grnIds || !Array.isArray(grnIds) || grnIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'At least one GRN must be selected for Progress Payment' },
          { status: 400 }
        );
      }

      // Verify all GRNs belong to the same project supplier
      const grns = await prisma.projectGRN.findMany({
        where: {
          id: { in: grnIds },
          projectSupplierId,
        },
      });

      if (grns.length !== grnIds.length) {
        return NextResponse.json(
          { success: false, error: 'One or more GRNs not found or do not belong to this supplier' },
          { status: 400 }
        );
      }
    }

    // Get VAT percentage from site settings
    const vatPercent = await getVatPercent();
    const vatDecimal = vatPercent / 100; // e.g., 0.05 for 5%
    const vatMultiplier = 1 + vatDecimal; // e.g., 1.05 for 5%

    // Calculate invoice amounts if not provided (for backward compatibility)
    let finalInvoiceAmount = invoiceAmount;
    let finalVatAmount = vatAmount;
    let finalTotalAmount = totalAmount;

    if (paymentType === 'Down Payment') {
      if (finalInvoiceAmount === undefined || finalVatAmount === undefined || finalTotalAmount === undefined) {
        const baseAmount = parseFloat(downPayment);
        finalInvoiceAmount = baseAmount;
        finalVatAmount = baseAmount * vatDecimal;
        finalTotalAmount = baseAmount * vatMultiplier;
      }
    } else {
      // Progress Payment - calculate from GRN amounts
      if (finalInvoiceAmount === undefined || finalVatAmount === undefined || finalTotalAmount === undefined) {
        // Verify all GRNs belong to the same project supplier
        const selectedGRNs = await prisma.projectGRN.findMany({
          where: {
            id: { in: grnIds },
            projectSupplierId,
          },
        });
        const baseAmount = selectedGRNs.reduce((sum, grn) => sum + Number(grn.deliveredAmount), 0);
        // Recovery is deducted BEFORE VAT
        const recovery = downPaymentRecovery ? parseFloat(downPaymentRecovery) : 0;
        const amountAfterRecovery = baseAmount - recovery;
        // Invoice Amount should be the amount after recovery (excluding VAT)
        finalInvoiceAmount = amountAfterRecovery;
        finalVatAmount = amountAfterRecovery * vatDecimal;
        finalTotalAmount = amountAfterRecovery + finalVatAmount;
      }
    }

    // Handle downPaymentRecovery
    const finalDownPaymentRecovery = paymentType === 'Progress Payment' && downPaymentRecovery 
      ? parseFloat(downPaymentRecovery) 
      : null;

    // Update invoice and its relationships
    // First, delete existing GRN relationships (if any)
    await prisma.invoiceGRN.deleteMany({
      where: { invoiceId: invoiceIdNum },
    });

    // Then update invoice with appropriate relationships
    const invoiceData: any = {
      invoiceNumber,
      invoiceDate: parseDateFromInput(invoiceDate),
      dueDate: dueDate ? parseDateFromInput(dueDate) : null,
      paymentType,
      downPayment: paymentType === 'Down Payment' ? parseFloat(downPayment) : null,
      purchaseOrderId: paymentType === 'Down Payment' ? purchaseOrderId : null,
      invoiceAmount: parseFloat(finalInvoiceAmount.toFixed(2)),
      vatAmount: parseFloat(finalVatAmount.toFixed(2)),
      downPaymentRecovery: finalDownPaymentRecovery ? parseFloat(finalDownPaymentRecovery.toFixed(2)) : null,
      totalAmount: parseFloat(finalTotalAmount.toFixed(2)),
    };

    if (paymentType === 'Progress Payment') {
      invoiceData.invoiceGRNs = {
        create: grnIds.map((grnId: number) => ({
          grnId,
        })),
      };
    }

    const invoice = await prisma.projectInvoice.update({
      where: { id: invoiceIdNum },
      data: invoiceData,
      include: {
        purchaseOrder: true,
        invoiceGRNs: {
          include: {
            grn: {
              include: {
                purchaseOrder: true,
              },
            },
          },
        },
      },
    });

    // Recalculate and update invoice status (especially if due date changed)
    await updateInvoiceStatus(invoice.id);

    // Fetch updated invoice with status
    const updatedInvoice = await prisma.projectInvoice.findUnique({
      where: { id: invoice.id },
      include: {
        purchaseOrder: true,
        invoiceGRNs: {
          include: {
            grn: {
              include: {
                purchaseOrder: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedInvoice });
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    // Handle unique constraint violation
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An invoice with this number already exists for this supplier' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invoiceId: string }> }
) {
  try {
    const { id, invoiceId } = await params;
    const invoiceIdNum = parseInt(invoiceId);
    
    if (isNaN(invoiceIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }

    // Delete the invoice (cascade will delete invoiceGRNs)
    await prisma.projectInvoice.delete({
      where: { id: invoiceIdNum },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}

