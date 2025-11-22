import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';

// GET - Fetch all invoices for a project supplier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSupplierId = parseInt(id);
    
    if (isNaN(projectSupplierId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project supplier ID' },
        { status: 400 }
      );
    }

    const invoices = await prisma.projectInvoice.findMany({
      where: { projectSupplierId },
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
      orderBy: { invoiceDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST - Create a new invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSupplierId = parseInt(id);
    
    if (isNaN(projectSupplierId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project supplier ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { invoiceNumber, invoiceDate, dueDate, purchaseOrderId, grnIds, paymentType, downPayment, invoiceAmount, vatAmount, downPaymentRecovery, totalAmount } = body;

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

    // Get the project supplier to get projectId
    const projectSupplier = await prisma.projectSupplier.findUnique({
      where: { id: projectSupplierId },
    });

    if (!projectSupplier) {
      return NextResponse.json(
        { success: false, error: 'Project supplier not found' },
        { status: 404 }
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

      // Check if a down payment already exists for this project (across all suppliers)
      const existingDownPayment = await prisma.projectInvoice.findFirst({
        where: {
          projectId: projectSupplier.projectId,
          paymentType: 'Down Payment',
        },
        select: { id: true },
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

    // Calculate invoice amounts if not provided (for backward compatibility)
    let finalInvoiceAmount = invoiceAmount;
    let finalVatAmount = vatAmount;
    let finalTotalAmount = totalAmount;

    if (paymentType === 'Down Payment') {
      if (finalInvoiceAmount === undefined || finalVatAmount === undefined || finalTotalAmount === undefined) {
        const baseAmount = parseFloat(downPayment);
        finalInvoiceAmount = baseAmount;
        finalVatAmount = baseAmount * 0.05;
        finalTotalAmount = baseAmount * 1.05;
      }
    } else {
      // Progress Payment - calculate from GRN amounts
      if (finalInvoiceAmount === undefined || finalVatAmount === undefined || finalTotalAmount === undefined) {
        // Calculate total from GRN amounts
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
        finalVatAmount = amountAfterRecovery * 0.05;
        finalTotalAmount = amountAfterRecovery + finalVatAmount;
      }
    }

    // Handle downPaymentRecovery
    const finalDownPaymentRecovery = paymentType === 'Progress Payment' && downPaymentRecovery 
      ? parseFloat(downPaymentRecovery) 
      : null;

    // Create invoice with appropriate relationships
    const invoiceData: any = {
      projectId: projectSupplier.projectId,
      projectSupplierId,
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

    const invoice = await prisma.projectInvoice.create({
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

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An invoice with this number already exists for this supplier' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

