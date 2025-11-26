import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';
import { updateInvoiceStatus } from '@/lib/invoiceStatus';

// Helper function to get VAT percentage from site settings
async function getVatPercent(): Promise<number> {
  const siteSettings = await prisma.siteSettings.findFirst();
  return siteSettings?.vatPercent ? Number(siteSettings.vatPercent) : 5; // Default to 5%
}

// GET - Fetch all invoices for a project subcontractor
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

    const invoices = await prisma.projectSubcontractorInvoice.findMany({
      where: { projectSubcontractorId },
      include: {
        purchaseOrder: true,
        invoiceChangeOrders: {
          include: {
            changeOrder: {
              include: {
                purchaseOrder: true,
              },
            },
          },
        },
        paymentInvoices: {
          include: {
            payment: true,
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
    const projectSubcontractorId = parseInt(id);
    
    if (isNaN(projectSubcontractorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project subcontractor ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { invoiceNumber, invoiceDate, dueDate, purchaseOrderId, changeOrderIds, paymentType, downPayment, invoiceAmount, vatAmount, downPaymentRecovery, totalAmount } = body;

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

    // Get the project subcontractor to get projectId
    const projectSubcontractor = await prisma.projectSubcontractor.findUnique({
      where: { id: projectSubcontractorId },
    });

    if (!projectSubcontractor) {
      return NextResponse.json(
        { success: false, error: 'Project subcontractor not found' },
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

      // Check if a down payment already exists for this project (across all subcontractors)
      const existingDownPayment = await prisma.projectSubcontractorInvoice.findFirst({
        where: {
          projectId: projectSubcontractor.projectId,
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

      // Verify the PO belongs to this subcontractor
      const po = await prisma.projectSubcontractorPurchaseOrder.findFirst({
        where: {
          id: purchaseOrderId,
          projectSubcontractorId,
        },
      });

      if (!po) {
        return NextResponse.json(
          { success: false, error: 'Purchase Order not found or does not belong to this subcontractor' },
          { status: 400 }
        );
      }
    } else {
      // Progress Payment - down payment should be null, need Change Orders
      if (downPayment) {
        return NextResponse.json(
          { success: false, error: 'Down payment amount should not be provided for Progress Payment type' },
          { status: 400 }
        );
      }

      if (!changeOrderIds || !Array.isArray(changeOrderIds) || changeOrderIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'At least one Change Order must be selected for Progress Payment' },
          { status: 400 }
        );
      }

      // Verify all Change Orders belong to the same project subcontractor
      const changeOrders = await prisma.projectSubcontractorChangeOrder.findMany({
        where: {
          id: { in: changeOrderIds },
          projectSubcontractorId,
        },
      });

      if (changeOrders.length !== changeOrderIds.length) {
        return NextResponse.json(
          { success: false, error: 'One or more Change Orders not found or do not belong to this subcontractor' },
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
      // Progress Payment - calculate from Change Order amounts
      if (finalInvoiceAmount === undefined || finalVatAmount === undefined || finalTotalAmount === undefined) {
        // Calculate total from Change Order amounts
        // For addition: add amount, for omission: subtract amount
        const selectedChangeOrders = await prisma.projectSubcontractorChangeOrder.findMany({
          where: {
            id: { in: changeOrderIds },
            projectSubcontractorId,
          },
        });
        const baseAmount = selectedChangeOrders.reduce((sum, co) => {
          const amount = Number(co.amount);
          return co.type === 'addition' ? sum + amount : sum - amount;
        }, 0);
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

    // Create invoice with appropriate relationships
    const invoiceData: any = {
      projectId: projectSubcontractor.projectId,
      projectSubcontractorId,
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
      invoiceData.invoiceChangeOrders = {
        create: changeOrderIds.map((changeOrderId: number) => ({
          changeOrderId,
        })),
      };
    }

    const invoice = await prisma.projectSubcontractorInvoice.create({
      data: invoiceData,
      include: {
        purchaseOrder: true,
        invoiceChangeOrders: {
          include: {
            changeOrder: {
              include: {
                purchaseOrder: true,
              },
            },
          },
        },
      },
    });

    // Calculate and update invoice status
    await updateInvoiceStatus(invoice.id);

    // Fetch updated invoice with status
    const updatedInvoice = await prisma.projectSubcontractorInvoice.findUnique({
      where: { id: invoice.id },
      include: {
        purchaseOrder: true,
        invoiceChangeOrders: {
          include: {
            changeOrder: {
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
    console.error('Error creating invoice:', error);
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An invoice with this number already exists for this subcontractor' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

